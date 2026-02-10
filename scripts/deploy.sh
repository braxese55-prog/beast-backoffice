#!/bin/bash
# Auto-deploy script for Beast Back Office
# Usage: ./scripts/deploy.sh

echo "🚀 Triggering Vercel deployment..."

WEBHOOK_URL="$VERCEL_DEPLOY_HOOK"

if [ -z "$WEBHOOK_URL" ]; then
  echo "❌ Error: VERCEL_DEPLOY_HOOK not set"
  exit 1
fi

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"build": true}'

echo ""
echo "✅ Deploy triggered! Check Vercel dashboard for status."
