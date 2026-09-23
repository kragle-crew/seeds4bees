variable "project" {
  description = "Project slug; prefixes resource names and tags everything."
  type        = string
  default     = "seeds4bees"
}

variable "org" {
  description = "Owning GitHub organization; applied as a tag."
  type        = string
  default     = "kragle-crew"
}

variable "region" {
  description = "Primary AWS region for the stack."
  type        = string
  default     = "us-west-2"
}

variable "domain_name" {
  description = "Apex domain served by CloudFront."
  type        = string
  default     = "seeds4bees.net"
}

variable "github_repo" {
  description = "GitHub repo (owner/name) allowed to assume the deploy role."
  type        = string
  default     = "kragle-crew/seeds4bees"
}

variable "deploy_branch" {
  description = <<-EOT
    The only git ref permitted to assume the deploy role. Pull requests run on
    a different ref and are therefore refused AWS credentials by the role's
    trust policy, not merely by workflow configuration.
  EOT
  type        = string
  default     = "main"
}
