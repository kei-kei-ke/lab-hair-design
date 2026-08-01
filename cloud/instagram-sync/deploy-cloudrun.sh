#!/usr/bin/env bash
set -euo pipefail

# Usage:
# PROJECT=your-gcp-project REGION=us-central1 ./deploy-cloudrun.sh

PROJECT=${PROJECT:-$(gcloud config get-value project 2>/dev/null)}
REGION=${REGION:-us-central1}
SERVICE=${SERVICE:-instagram-sync}
IMAGE=gcr.io/${PROJECT}/${SERVICE}:latest
SA=${SA:-instagram-sync-sa@${PROJECT}.iam.gserviceaccount.com}

if [ -z "$PROJECT" ]; then
  echo "Set PROJECT env or run 'gcloud config set project PROJECT'"
  exit 1
fi

echo "Building image: $IMAGE"
gcloud builds submit --tag "$IMAGE" .

echo "Deploying Cloud Run service: $SERVICE"
# Deploy with secrets mounted from Secret Manager (requires secrets to exist)
# Adjust --set-secrets values to match your secret resource names if different.
gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --region "$REGION" \
  --platform managed \
  --no-allow-unauthenticated \
  --service-account "$SA" \
  --set-secrets "IG_USER_ID=projects/${PROJECT}/secrets/IG_USER_ID:latest,IG_TOKEN=projects/${PROJECT}/secrets/IG_TOKEN:latest,WP_BASE=projects/${PROJECT}/secrets/WP_BASE:latest,WP_USER=projects/${PROJECT}/secrets/WP_USER:latest,WP_APP_PASSWORD=projects/${PROJECT}/secrets/WP_APP_PASSWORD:latest"

echo "Deployment finished. Service URL:"
gcloud run services describe "$SERVICE" --region "$REGION" --format 'value(status.url)'

echo "Next: create a Scheduler job that calls the service (see CLOUD_RUN_SETUP.md)"
