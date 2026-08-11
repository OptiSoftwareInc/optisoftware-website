#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Validating SAM template..."
sam validate \
  --lint \
  --region us-east-1 \
  --profile prod-sso

echo "Building application..."
sam build

echo "Deploying production contact-form stack..."
sam deploy \
  --config-env prod
