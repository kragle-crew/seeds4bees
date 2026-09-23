provider "aws" {
  region = var.region

  default_tags {
    tags = local.tags
  }
}

# CloudFront requires its ACM certificate to live in us-east-1, regardless of
# where the rest of the stack runs.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = local.tags
  }
}

data "aws_caller_identity" "current" {}

locals {
  tags = {
    project = var.project
    org     = var.org
  }

  # Every resource name derives from this, so the whole stack is greppable and
  # can coexist with other projects in the same account.
  name = var.project
}
