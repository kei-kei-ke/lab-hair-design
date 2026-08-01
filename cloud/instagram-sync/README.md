Instagram → WordPress sync

Overview
- Small Node.js ESM handler that fetches Instagram Graph API media and creates a corresponding
  `instagram_media` post in WordPress, uploading the asset to WP Media.

Requirements
- Node 18+ runtime (Cloud Run, Cloud Functions 2nd gen, etc.)
- WordPress must expose an endpoint `/wp-json/ig-sync/v1/exists?ig_id=...` which returns
  `{ "exists": true }` when the Instagram ID is already recorded (simple WP plugin can do this).
- WordPress must accept media uploads via `/wp-json/wp/v2/media` using Basic Auth (App Password)
  and accept creation of a `instagram_media` post type via `/wp-json/wp/v2/instagram_media`.

Environment variables (.env)
- IG_USER_ID
- IG_TOKEN (long-lived token)
- WP_BASE
- WP_USER
- WP_APP_PASSWORD

Deployment (Cloud Run example)
1. Build container Dockerfile (simple Node 18 image, copy index.mjs)
2. Push to registry and deploy to Cloud Run with the env vars set via Secret Manager or Cloud Run env vars.
3. Use Cloud Scheduler to call the HTTP endpoint every N minutes to sync.

Notes & Next steps
- Implement retry/backoff for transient failures and implement idempotency keys in WP.
- Implement the WP side small plugin for `/ig-sync/v1/exists` and to save `instagram_id` meta when creating posts.
- Consider storing original IG URL and media thumbnails in WP post meta for traceability.
