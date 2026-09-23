output "site_url" {
  description = "Public URL of the site."
  value       = "https://${var.domain_name}"
}

output "site_bucket" {
  description = "S3 bucket holding the built static site."
  value       = aws_s3_bucket.site.id
}

output "cloudfront_distribution_id" {
  description = "Needed by the deploy workflow to invalidate the cache."
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain_name" {
  description = "Distribution hostname, useful for debugging DNS."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "api_endpoint" {
  description = "Direct API Gateway endpoint, bypassing CloudFront."
  value       = aws_apigatewayv2_api.api.api_endpoint
}

output "deploy_role_arn" {
  description = "Role assumed by GitHub Actions. Set as the AWS_DEPLOY_ROLE_ARN repo variable."
  value       = aws_iam_role.github_deploy.arn
}

output "dynamodb_table" {
  description = "Name of the single DynamoDB table."
  value       = aws_dynamodb_table.main.name
}
