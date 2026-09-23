#!/usr/bin/env bash
#
# Wrapper for `terraform init` that derives the state bucket name from the
# caller's AWS account, keeping the account id out of version control.
#
# Usage: ./init.sh [extra terraform init args...]

set -euo pipefail

cd "$(dirname "$0")"

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
BUCKET="seeds4bees-tfstate-${ACCOUNT_ID}"

exec terraform init \
  -backend-config="bucket=${BUCKET}" \
  "$@"
