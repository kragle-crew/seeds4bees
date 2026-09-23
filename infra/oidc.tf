# GitHub Actions -> AWS via OIDC. No long-lived access keys exist anywhere.
#
# The provider already exists in this account and is shared with other
# projects, so it is read, never managed, here.
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

locals {
  github_owner = split("/", var.github_repo)[0]
  github_name  = split("/", var.github_repo)[1]

  # GitHub is rolling out immutable numeric ids inside the subject claim, so a
  # token may spell the repo either way:
  #
  #   repo:kragle-crew/seeds4bees:ref:refs/heads/main
  #   repo:kragle-crew@231585183/seeds4bees@1380718162:ref:refs/heads/main
  #
  # Both forms are accepted so the role survives the rollout in either
  # direction. The wildcards are safe because `@` must follow each name
  # immediately: a lookalike org such as "kragle-crew-evil" fails to match,
  # since the literal prefix "kragle-crew@" does not appear in it.
  github_subjects = [
    "repo:${local.github_owner}/${local.github_name}:ref:refs/heads/${var.deploy_branch}",
    "repo:${local.github_owner}@*/${local.github_name}@*:ref:refs/heads/${var.deploy_branch}",
  ]
}

# The heart of the "PRs get no AWS access" requirement.
#
# `sub` is pinned to one branch ref. A pull_request run presents
# sub = "repo:<repo>:pull/<n>/merge", which matches neither pattern, so STS
# refuses the credentials outright. This holds even if a workflow is later
# misconfigured to request `id-token: write` on a PR, and it holds for forks.
data "aws_iam_policy_document" "github_deploy_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = local.github_subjects
    }
  }
}

resource "aws_iam_role" "github_deploy" {
  name               = "${local.name}-github-deploy"
  description        = "Deploy role for ${var.github_repo}, assumable only from refs/heads/${var.deploy_branch}."
  assume_role_policy = data.aws_iam_policy_document.github_deploy_trust.json

  # A deploy should never take an hour; keep the credential window short.
  max_session_duration = 3600
}

data "aws_iam_policy_document" "github_deploy" {
  # --- Terraform state ---
  statement {
    sid     = "TerraformState"
    effect  = "Allow"
    actions = ["s3:ListBucket", "s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = [
      "arn:aws:s3:::${local.name}-tfstate-${data.aws_caller_identity.current.account_id}",
      "arn:aws:s3:::${local.name}-tfstate-${data.aws_caller_identity.current.account_id}/*",
    ]
  }

  # --- Static site bucket ---
  statement {
    sid    = "SiteBucket"
    effect = "Allow"
    actions = [
      "s3:CreateBucket",
      "s3:Delete*",
      "s3:Get*",
      "s3:List*",
      "s3:Put*",
    ]
    resources = [
      aws_s3_bucket.site.arn,
      "${aws_s3_bucket.site.arn}/*",
    ]
  }

  # --- CloudFront ---
  # CloudFront's resource-level permissions do not cover distribution creation
  # or origin access control, so this stays service-wide.
  statement {
    sid       = "CloudFront"
    effect    = "Allow"
    actions   = ["cloudfront:*"]
    resources = ["*"]
  }

  # --- TLS certificate (us-east-1) ---
  # Certificate ARNs are randomly generated, so they cannot be pre-scoped.
  statement {
    sid    = "Acm"
    effect = "Allow"
    actions = [
      "acm:AddTagsToCertificate",
      "acm:DeleteCertificate",
      "acm:DescribeCertificate",
      "acm:ListCertificates",
      "acm:ListTagsForCertificate",
      "acm:RequestCertificate",
    ]
    resources = ["*"]
  }

  # --- DNS ---
  statement {
    sid       = "Route53Read"
    effect    = "Allow"
    actions   = ["route53:ListHostedZones", "route53:ListHostedZonesByName", "route53:GetChange"]
    resources = ["*"]
  }

  statement {
    sid    = "Route53Write"
    effect = "Allow"
    actions = [
      "route53:ChangeResourceRecordSets",
      "route53:GetHostedZone",
      "route53:ListResourceRecordSets",
      "route53:ListTagsForResource",
    ]
    resources = ["arn:aws:route53:::hostedzone/${data.aws_route53_zone.this.zone_id}"]
  }

  # --- Compute and data ---
  statement {
    sid       = "Lambda"
    effect    = "Allow"
    actions   = ["lambda:*"]
    resources = ["arn:aws:lambda:${var.region}:${data.aws_caller_identity.current.account_id}:function:${local.name}-*"]
  }

  statement {
    sid       = "ApiGateway"
    effect    = "Allow"
    actions   = ["apigateway:*"]
    resources = ["arn:aws:apigateway:${var.region}::*"]
  }

  statement {
    sid       = "DynamoDb"
    effect    = "Allow"
    actions   = ["dynamodb:*"]
    resources = ["arn:aws:dynamodb:${var.region}:${data.aws_caller_identity.current.account_id}:table/${local.name}*"]
  }

  # Covers both log groups the stack owns: the Lambda's and API Gateway's
  # access log. The `:*` variants match log streams within each group.
  statement {
    sid     = "Logs"
    effect  = "Allow"
    actions = ["logs:*"]
    resources = [
      "arn:aws:logs:${var.region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${local.name}-*",
      "arn:aws:logs:${var.region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${local.name}-*:*",
      "arn:aws:logs:${var.region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/apigateway/${local.name}-*",
      "arn:aws:logs:${var.region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/apigateway/${local.name}-*:*",
    ]
  }

  # DescribeLogGroups is an account-wide query that ignores resource scoping,
  # so it cannot be narrowed. It only reveals log group names.
  statement {
    sid       = "DescribeLogGroups"
    effect    = "Allow"
    actions   = ["logs:DescribeLogGroups"]
    resources = ["*"]
  }

  # --- IAM ---
  # Confined to this project's own role and policy names, so a compromised
  # deploy cannot mint itself unrelated privileges. Note this does include the
  # deploy role itself, which Terraform must be able to read and update.
  statement {
    sid    = "ProjectIam"
    effect = "Allow"
    actions = [
      "iam:AttachRolePolicy",
      "iam:CreateRole",
      "iam:DeleteRole",
      "iam:DeleteRolePolicy",
      "iam:DetachRolePolicy",
      "iam:GetRole",
      "iam:GetRolePolicy",
      "iam:ListAttachedRolePolicies",
      "iam:ListInstanceProfilesForRole",
      "iam:ListRolePolicies",
      "iam:PutRolePolicy",
      "iam:TagRole",
      "iam:UntagRole",
      "iam:UpdateAssumeRolePolicy",
    ]
    resources = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${local.name}-*"]
  }

  # The provider is looked up by URL, which the AWS provider implements as a
  # List followed by a Get. List takes no resource scope.
  statement {
    sid    = "ReadOidcProvider"
    effect = "Allow"
    actions = [
      "iam:GetOpenIDConnectProvider",
      "iam:ListOpenIDConnectProviders",
    ]
    resources = ["*"]
  }

  # Handing the Lambda service its execution role.
  statement {
    sid       = "PassLambdaExecRole"
    effect    = "Allow"
    actions   = ["iam:PassRole"]
    resources = [aws_iam_role.api_exec.arn]

    condition {
      test     = "StringEquals"
      variable = "iam:PassedToService"
      values   = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy" "github_deploy" {
  name   = "${local.name}-deploy"
  role   = aws_iam_role.github_deploy.id
  policy = data.aws_iam_policy_document.github_deploy.json
}
