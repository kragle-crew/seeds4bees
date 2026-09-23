terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.7"
    }
  }

  # Partial backend config: `bucket` is supplied at init time by ./init.sh so
  # the AWS account id stays out of this public repo.
  #
  # `use_lockfile` is Terraform >= 1.10 native S3 locking, which replaces the
  # old DynamoDB lock table.
  backend "s3" {
    key          = "infra/terraform.tfstate"
    region       = "us-west-2"
    encrypt      = true
    use_lockfile = true
  }
}
