IG Sync WordPress helper plugin

Install
1. Copy `ig-sync-plugin.php` to a folder `wp-content/plugins/ig-sync-plugin/ig-sync-plugin.php` on your WordPress installation.
2. Activate the plugin in WP Admin > Plugins.

What it provides
- REST endpoint: `GET /wp-json/ig-sync/v1/exists?ig_id=XXX`
  - Requires authentication with a user that has `edit_posts` capability (App Password user recommended).
  - Returns `{ "exists": true }` if a post of type `instagram_media` has `instagram_id` meta equal to the given id.
- Saves `instagram_id` meta when a new `instagram_media` post is created via the REST API (if `meta["instagram_id"]` is provided in the POST body).

Security
- The endpoint requires authentication. Use WordPress Application Passwords for the service account user you configure in Cloud Run.

Notes
- If your site does not have the `instagram_media` post type, either register it in your theme/plugin, or modify this plugin to use `post`/`attachment` as appropriate.
- The plugin registers `instagram_id` as post meta and exposes it to REST so that meta can be set during creation.
