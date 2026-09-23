#!/usr/bin/env bash
#
# One-time bootstrap: creates the S3 bucket that holds Terraform state.
#
# This exists as a script rather than Terraform to avoid the chicken-and-egg
# problem of storing the state bucket's own state. It is idempotent, so it is
# safe to re-run.
#
# Terraform >= 1.10 locks state with a lockfile in the bucket itself
# (`use_lockfile = true` in backend.tf), so no DynamoDB lock table is needed.

set -euo pipefail

REGION="${AWS_REGION:-us-west-2}"
PROJECT="seeds4bees"
ORG="kragle-crew"

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
BUCKET="${PROJECT}-tfstate-${ACCOUNT_ID}"

echo "Account:  ${ACCOUNT_ID}"
echo "Region:   ${REGION}"
echo "Bucket:   ${BUCKET}"
echo

if aws s3api head-bucket --bucket "${BUCKET}" 2>/dev/null; then
  echo "Bucket already exists, ensuring configuration is current."
else
  echo "Creating bucket."
  aws s3api create-bucket \
    --bucket "${BUCKET}" \
    --region "${REGION}" \
    --create-bucket-configuration "LocationConstraint=${REGION}"
fi

# Versioning: lets us recover a clobbered or corrupted state file.
aws s3api put-bucket-versioning \
  --bucket "${BUCKET}" \
  --versioning-configuration Status=Enabled

# Encryption at rest.
aws s3api put-bucket-encryption \
  --bucket "${BUCKET}" \
  --server-side-encryption-configuration \
    '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"},"BucketKeyEnabled":true}]}'

# State must never be public.
aws s3api put-public-access-block \
  --bucket "${BUCKET}" \
  --public-access-block-configuration \
    'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true'

# Reject any plaintext (non-TLS) access.
aws s3api put-bucket-policy \
  --bucket "${BUCKET}" \
  --policy "$(cat <<JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyInsecureTransport",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::${BUCKET}",
        "arn:aws:s3:::${BUCKET}/*"
      ],
      "Condition": { "Bool": { "aws:SecureTransport": "false" } }
    }
  ]
}
JSON
)"

aws s3api put-bucket-tagging \
  --bucket "${BUCKET}" \
  --tagging "TagSet=[{Key=project,Value=${PROJECT}},{Key=org,Value=${ORG}}]"

echo
echo "Done. State bucket ready: ${BUCKET}"
