# Seeds4Bees

The website for the Kragle Crew FIRST LEGO League team, at
**[seeds4bees.net](https://seeds4bees.net)**.

## Architecture

```
                    ┌─────────────┐
   visitor ────────▶│ CloudFront  │  TLS, custom domain, caching
                    └──────┬──────┘
                           │  splits on path
              ┌────────────┴────────────┐
              │                         │
         /api/*                        /*
              │                         │
   ┌──────────▼─────────┐     ┌─────────▼────────┐
   │ API Gateway (HTTP) │     │  S3 (private)    │
   └──────────┬─────────┘     │  static assets   │
              │               └──────────────────┘
        ┌─────▼─────┐
        │  Lambda   │  Node 22, arm64
        └─────┬─────┘
              │
      ┌───────▼───────┐
      │   DynamoDB    │  on-demand
      └───────────────┘
```

A single CloudFront distribution fronts everything, so the browser makes only
same-origin requests and there is no CORS to configure. S3 is private and
reachable solely through CloudFront's Origin Access Control.

### Why these pieces

The driving constraint is that an idle site should cost almost nothing. Every
component here bills per request or per byte stored, with nothing running
around the clock:

| Concern    | Choice                | Idle cost                            |
| ---------- | --------------------- | ------------------------------------ |
| Compute    | Lambda                | nothing                              |
| Routing    | API Gateway HTTP API  | nothing (and ~⅓ the price of REST)   |
| Data       | DynamoDB on-demand    | nothing beyond bytes stored          |
| Static     | S3 + CloudFront       | pennies; generous always-free tier   |
| TLS        | ACM                   | free                                 |

Deliberately avoided: ELB, ECS, RDS, and NAT gateways, each of which bills by
the hour whether or not anyone visits. The Lambda is intentionally **not** in a
VPC, since a private-subnet Lambda needs a NAT gateway (~$32/month) to reach
anything.

## Layout

```
api/        Lambda backend (Node, ESM, no build step)
web/        React front end (Vite)
infra/      Terraform for the whole stack
.github/    CI and deploy workflows
```

## Deployment and access control

Two workflows, split by whether they need AWS:

| Workflow     | Trigger        | AWS access                    |
| ------------ | -------------- | ----------------------------- |
| `ci.yml`     | pull requests  | **none**                      |
| `deploy.yml` | push to `main` | OIDC, short-lived credentials |

Pull requests are locked out of AWS three times over:

1. `ci.yml` never requests the `id-token: write` permission, so it cannot mint
   an OIDC token at all.
2. Its Terraform steps run with `-backend=false`, so they never reach for
   remote state.
3. The deploy role's trust policy matches `sub` with `StringEquals` against
   exactly `repo:kragle-crew/seeds4bees:ref:refs/heads/main`. A pull request
   presents `repo:.../pull/<n>/merge`, so STS refuses it. **This is the control
   that matters** — it holds even if a workflow file is later misconfigured, and
   it holds for forks.

No AWS access keys exist anywhere in GitHub. The only configuration is a repo
variable, `AWS_DEPLOY_ROLE_ARN`.

## First-time setup

Run once, with credentials that can create IAM roles:

```bash
# 1. Create the Terraform state bucket.
./infra/bootstrap.sh

# 2. Create the stack, including the deploy role.
./infra/init.sh
cd infra && terraform apply

# 3. Hand the role to GitHub.
gh variable set AWS_DEPLOY_ROLE_ARN \
  --repo kragle-crew/seeds4bees \
  --body "$(terraform output -raw deploy_role_arn)"
```

The first apply takes roughly 5-15 minutes, nearly all of it waiting on
certificate validation and CloudFront propagation. Afterwards, every push to
`main` deploys on its own.

## Working locally

```bash
# Front end, proxying /api to the deployed backend.
cd web && npm install && npm run dev

# Backend tests. No AWS credentials needed.
cd api && npm install && npm test
```

Adding an API endpoint is a code change, not an infrastructure change: API
Gateway forwards every path to the Lambda, and `api/src/router.mjs` holds the
route table.

## Conventions

Every AWS resource is tagged `project=seeds4bees` and `org=kragle-crew`, which
makes cost attribution and cleanup straightforward.

State lives in `s3://seeds4bees-tfstate-<account-id>`, locked with Terraform's
native S3 lockfile. The account id is supplied at init time by `infra/init.sh`
rather than committed, since this repo is public.
