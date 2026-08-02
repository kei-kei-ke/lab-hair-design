# Deployment Notes

This repository is maintained for a WordPress (SWELL) production site.

Astro is used only as a local preview/development aid for working with WordPress content through the Lab Headless Bridge plugin. It is not used as the production deployment target.

Production delivery is handled by WordPress/SWELL directly. GitHub Actions, FTP deployment, and other Astro publish workflows are not part of the production path.

## Required WordPress plugin settings

In the WordPress admin, open **Settings > Lab Headless Settings** and set at least:

- `InstagramアカウントURL`
- `Instagramフィード(JSON)` or ensure `/wp-json/lab/v1/instagram-feed` returns items
- `住所`
- `営業時間`
- `定休日`
- `電話URL` if you want the WP-side phone URL kept in sync

The plugin already exposes:

- `/wp-json/lab/v1/site-content`
- `/wp-json/lab/v1/instagram-feed`

## Astro environment variables

Copy `.env.example` to `.env` and set production values:

- `PUBLIC_SITE_URL=https://lab-hair-design.com`
- `WORDPRESS_BASE_URL=https://lab-hair-design.com`
- `PUBLIC_WORDPRESS_BASE_URL=https://lab-hair-design.com`
- `PUBLIC_INSTAGRAM_FEED_URL` if the feed is served from a different URL

## Build command

```bash
npm run build
```

This generates the static site in `dist/`.

## Auto build/deploy webhook for ConoHa WING (Static only)

This project keeps Astro static and automatically rebuilds + deploys on WordPress updates.

Flow:

WordPress -> Webhook -> GitHub Actions -> ConoHa WING deploy

### 1) GitHub Actions file

Workflow file:

- `.github/workflows/wp-webhook-deploy.yml`

Trigger:

- `repository_dispatch` with event type `wp_content_updated`

Action:

1. `npm ci`
2. `npm run build`
3. Upload `dist/` to ConoHa by FTPS

### 2) Required GitHub Secrets (exact names)

Set these in GitHub repository settings:

1. `CONOHA_FTP_HOST`
2. `CONOHA_FTP_PORT`
3. `CONOHA_FTP_USERNAME`
4. `CONOHA_FTP_PASSWORD`
5. `CONOHA_FTP_REMOTE_DIR`

Values example:

- `CONOHA_FTP_HOST`: FTP host shown in ConoHa WING account settings
- `CONOHA_FTP_PORT`: usually `21`
- `CONOHA_FTP_USERNAME`: FTP username
- `CONOHA_FTP_PASSWORD`: FTP password
- `CONOHA_FTP_REMOTE_DIR`: upload destination, example `/public_html/`

### 3) Create GitHub token for WordPress webhook

WordPress needs a GitHub token to call repository dispatch API.

1. Open GitHub -> Settings -> Developer settings -> Personal access tokens.
2. Create token (classic token is easiest for beginners).
3. Grant `repo` scope.
4. Copy token once and keep it safe.

Use this token in WordPress settings as `Bearer <TOKEN>`.

### 4) ConoHa WING side setup

1. Log in to ConoHa WING control panel.
2. Open your site settings for target domain.
3. Open FTP account settings.
4. Confirm host, port, username, password.
5. Confirm deploy target directory (document root or a dedicated folder).

Important safety note:

- If WordPress and Astro are in different directories, set `CONOHA_FTP_REMOTE_DIR` to Astro publish directory only.
- Do not point to a directory that would overwrite unrelated WordPress system files.

### 5) WordPress side setup

Open **Settings > Lab Headless Settings** and set these fields:

1. `Deploy Webhook URL`
	 - `https://api.github.com/repos/<OWNER>/<REPO>/dispatches`
2. `Deploy Webhook 認証ヘッダー名（任意）`
	 - `Authorization`
3. `Deploy Webhook 認証トークン（任意）`
	 - `Bearer <YOUR_GITHUB_PAT>`
4. `Deploy Webhook event_type`
	 - `wp_content_updated`
5. `Deploy Webhook 連続発火抑制秒数`
	 - `15` recommended

Then click save.

### 6) What triggers deploy automatically

The plugin automatically dispatches on:

1. `lab_style` create/edit/delete/trash/untrash
2. `lab_photo` create/edit/delete/trash/untrash
3. Featured image change
4. Media add/edit/delete

### 7) End-to-end test (beginner checklist)

1. In WordPress, add one `lab_style` post with featured image.
2. Open GitHub -> Actions.
3. Confirm workflow `Build and Deploy (WordPress Webhook)` starts automatically.
4. Wait until it is green (success).
5. Open public site and verify image is reflected.
6. Delete or edit same post and repeat to confirm auto-update.

### 8) If it does not trigger

Check in this order:

1. Webhook URL owner/repo typo.
2. Token format: must be `Bearer <TOKEN>`.
3. Token scope missing `repo`.
4. GitHub Secrets typo (names must match exactly above).
5. ConoHa FTP host/dir mismatch.
6. WordPress outbound HTTPS blocked by server/security plugin.

## Deployment to ConoHa WING

Upload the contents of `dist/` to the web root or the target directory in ConoHa WING.

Typical options:

1. Deploy the Astro site to the domain root if WordPress is not serving the front-end.
2. Deploy the Astro site to a separate subdirectory or subdomain if WordPress is used only as the CMS backend.

If WordPress must remain at the same root, keep the Astro front-end on a separate path or subdomain to avoid route conflicts.

### ConoHa WING upload steps

1. Log in to the ConoHa WING control panel.
2. From the top menu, open the site list or domain management screen.
3. Click the target domain `lab-hair-design.com`.
4. Open the site settings or file management area for that domain.
5. Choose one of the following upload methods.

#### Method A: File manager upload

1. Open the file manager.
2. Enter the public directory for the domain, usually the document root.
3. If you are replacing an older build, delete or rename the existing front-end files first after taking a backup.
4. Upload the contents of `dist/`, not the `dist` folder itself.
5. After upload, confirm that `index.html` sits at the publish root.
6. Confirm that folders such as `_astro/`, `hair/`, `info/`, `staff/`, `shop/`, and `recruit/` are present.

#### Method B: FTP / SFTP upload

1. Open the FTP/SFTP connection settings in ConoHa.
2. Copy the host name, user name, and password shown there.
3. Connect from your FTP client.
4. Open the public directory for `lab-hair-design.com`.
5. Upload the contents of `dist/` into that directory.
6. Verify that `index.html` and the generated folders are uploaded at the root.

#### What to upload

- `dist/index.html`
- `dist/_astro/`
- `dist/hair/`
- `dist/info/`
- `dist/staff/`
- `dist/shop/`
- `dist/recruit/`
- `dist/access/`

Do not upload the `dist` folder itself as a nested folder if the public root should serve the site directly.

### WordPress admin steps

1. Open the WordPress dashboard.
2. In the left sidebar, click **Settings**.
3. Click **Lab Headless Settings**.
4. Fill in the fields below.

#### Fields to enter

- `InstagramアカウントURL`
	- Example: `https://www.instagram.com/lab_hair_design/`
	- This is used by the home page when the Instagram feed fallback is needed.

- `Instagramフィード(JSON)`
	- Paste valid JSON if you want to control the feed from WordPress.
	- Example structure:
		```json
		[{"id":"1","permalink":"https://www.instagram.com/p/...","mediaUrl":"https://...jpg","caption":"..."}]
		```
	- If you already have the custom endpoint working, this can be left as configured on the WP side.

- `住所`
	- Example: `〒422-8067 静岡県静岡市駿河区南町7-9 サウスパラシオン2階`

- `営業時間`
	- Example: `平日 10:00 — 20:00 / 土日祝 10:00 — 19:00`

- `定休日`
	- Example: `火曜定休・第1第3月曜`

- `電話URL`
	- Example: `tel:0542027130` or the site-specific phone URL if you manage it in WP

- `アクセス概要`
	- Optional, used only if you later want to surface a short summary on the front-end

- `リード文` / `導入文` / `特徴（改行区切り）`
	- Fill these only if you want the public pages to reflect WordPress-managed copy

5. Scroll to the bottom and click **Save Changes**.
6. Reload the settings page once to confirm the values remain saved.
7. Check that these endpoints return JSON in a browser:
	 - `/wp-json/lab/v1/site-content`
	 - `/wp-json/lab/v1/instagram-feed`

#### What to verify in the JSON response

- The response should not be an error page.
- `salon` should include your current site information.
- `instagramFeed` should be an array.
- `staffMembers`, `hairStyles`, and `priceSections` should still be returned if you use the Astro site content fallback.

### Recommended production values

- `WORDPRESS_BASE_URL=https://lab-hair-design.com`
- `PUBLIC_WORDPRESS_BASE_URL=https://lab-hair-design.com`
- `PUBLIC_SITE_URL=https://lab-hair-design.com`
- `PUBLIC_INSTAGRAM_URL=https://www.instagram.com/lab_hair_design/`

### Final verification checklist

- Open `https://lab-hair-design.com`
- Confirm the hero image and Instagram single-card render correctly
- Open `https://lab-hair-design.com/info` and confirm the three minimal rows
- Open `https://lab-hair-design.com/hair` and confirm the 3x3 grid
- Tap the phone icon and confirm it launches `tel:0542027130`
- Check the browser console for any failed fetch requests to WordPress

## Verification

After upload, confirm:

- `/` loads the Astro front page
- `/wp-json/lab/v1/site-content` responds from WordPress
- `/wp-json/lab/v1/instagram-feed` responds from WordPress
- the site uses HTTPS on `https://lab-hair-design.com`