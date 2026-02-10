#!/bin/bash
# Auto-deploy script for Beast Back Office - CNXB Project
# Usage: ./scripts/deploy-cnxb.sh

echo "🚀 Triggering Vercel deployment for beast-backoffice-cnxb..."

WEBHOOK_URL="$VERCEL_DEPLOY_HOOK_CNXB"

if [ -z "$WEBHOOK_URL" ]; then
  echo "❌ Error: VERCEL_DEPLOY_HOOK_CNXB not set"
  exit 1
fi

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"build": true}'

echo ""
echo "✅ Deploy triggered for beast-backoffice-cnxb! Check Vercel dashboard for status."
