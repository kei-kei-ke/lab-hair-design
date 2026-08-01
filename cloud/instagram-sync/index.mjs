/**
 * Instagram → WordPress sync function (HTTP handler)
 * - Designed to run as a Cloud Function / Cloud Run service (Node 18+)
 * - Uses environment variables (see README and .env.example)
 *
 * Behavior:
 * 1. Fetch recent media from Instagram Graph API
 * 2. For each item, check WP for existing record via a small custom endpoint
 * 3. If new, download image and upload to WP Media, then create a custom post (instagram_media)
 *
 * NOTE: This script expects your WordPress to expose a small helper endpoint
 * (e.g. /wp-json/ig-sync/v1/exists?ig_id=...) that returns { exists: true } when
 * the Instagram ID is already recorded. Implementing that endpoint in WP (simple plugin)
 * is recommended. See README for guidance.
 */

const IG_USER_ID = process.env.IG_USER_ID;
const IG_TOKEN = process.env.IG_TOKEN;
const WP_BASE = process.env.WP_BASE; // e.g. https://example.com
const WP_USER = process.env.WP_USER; // app password user
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;

if (!IG_USER_ID || !IG_TOKEN || !WP_BASE || !WP_USER || !WP_APP_PASSWORD) {
  // don't throw at import time in Cloud environments; just warn
  console.warn('Missing required env vars for instagram-sync. See README.');
}

async function fetchJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`fetch ${url} failed ${r.status}`);
  return r.json();
}

async function getIgMedia() {
  const url = `https://graph.instagram.com/${IG_USER_ID}/media?fields=id,caption,media_url,permalink,timestamp&limit=25&access_token=${IG_TOKEN}`;
  return fetchJson(url).then(d => d.data || []);
}

async function checkExistsInWP(igId) {
  try {
    const url = `${WP_BASE.replace(/\/$/, '')}/wp-json/ig-sync/v1/exists?ig_id=${encodeURIComponent(igId)}`;
    const r = await fetch(url, { method: 'GET' });
    if (!r.ok) return false;
    const j = await r.json();
    return !!j.exists;
  } catch (e) {
    console.warn('exists check failed', e.message);
    return false; // be conservative and try to upload
  }
}

async function downloadToBuffer(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download failed ${r.status}`);
  const ab = await r.arrayBuffer();
  return Buffer.from(ab);
}

function wpAuthHeader() {
  return 'Basic ' + Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64');
}

async function uploadMediaToWP(buffer, filename, mime) {
  const url = `${WP_BASE.replace(/\/$/, '')}/wp-json/wp/v2/media`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: wpAuthHeader(),
      'Content-Type': mime,
      'Content-Disposition': `attachment; filename="${filename}"`
    },
    body: buffer
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WP media upload failed ${res.status} ${body}`);
  }
  return res.json();
}

async function createInstagramPostInWP({ igId, caption, permalink, mediaId }) {
  const url = `${WP_BASE.replace(/\/$/, '')}/wp-json/wp/v2/instagram_media`;
  const body = {
    title: `Instagram ${igId}`,
    content: caption || '',
    status: 'publish',
    meta: { instagram_id: igId, instagram_permalink: permalink },
    featured_media: mediaId
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: wpAuthHeader(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WP create instagram_media failed ${res.status} ${text}`);
  }
  return res.json();
}

async function syncOnce() {
  const items = await getIgMedia();
  const results = [];
  for (const it of items) {
    const igId = it.id;
    const exists = await checkExistsInWP(igId);
    if (exists) { results.push({ igId, status: 'skipped' }); continue; }
    // download
    try {
      const buf = await downloadToBuffer(it.media_url);
      const ext = (it.media_url.split('.').pop().split('?')[0]) || 'jpg';
      const filename = `ig-${igId}.${ext}`;
      const mime = buf.slice(0,4).toString('hex').startsWith('ffd8') ? 'image/jpeg' : 'image/png';
      const media = await uploadMediaToWP(buf, filename, mime);
      const created = await createInstagramPostInWP({ igId, caption: it.caption || '', permalink: it.permalink, mediaId: media.id });
      results.push({ igId, status: 'created', mediaId: media.id, postId: created.id });
    } catch (e) {
      console.error('sync error', igId, e.message);
      results.push({ igId, status: 'error', message: e.message });
    }
  }
  return results;
}

// Cloud Function / Cloud Run HTTP handler
export async function handler(req, res) {
  try {
    const r = await syncOnce();
    res.status(200).json({ ok: true, result: r });
  } catch (e) {
    console.error('fatal sync', e);
    res.status(500).json({ ok: false, error: e.message });
  }
}

// If run directly (node index.mjs), execute once and print
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('index.mjs')) {
  (async () => {
    try {
      const r = await syncOnce();
      console.log('sync finished', r);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}
