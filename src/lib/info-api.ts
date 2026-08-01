const DEFAULT_BASES = ['https://lab-hair-design.com', 'https://www.lab-hair-design.com'];

export function buildInfoEndpoints(wpBase: string, explicitPostsEndpoint: string): string[] {
  const bases = [wpBase, ...DEFAULT_BASES]
    .filter(Boolean)
    .map((value) => String(value).replace(/\/$/, ''));

  const normalizedExplicitEndpoint = String(explicitPostsEndpoint || '')
    .replace('/wp/v2/posts', '/wp/v2/lab_info')
    .replace('rest_route=/wp/v2/posts', 'rest_route=/wp/v2/lab_info');

  return [
    normalizedExplicitEndpoint,
    ...bases.map((base) => `${base}/wp-json/wp/v2/lab_info?_embed=1&per_page=50&orderby=date&order=desc`),
    ...bases.map((base) => `${base}/index.php/wp-json/wp/v2/lab_info?_embed=1&per_page=50&orderby=date&order=desc`),
    ...bases.map((base) => `${base}/wordpress/wp-json/wp/v2/lab_info?_embed=1&per_page=50&orderby=date&order=desc`),
  ]
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);
}

export async function fetchInfoPosts(wpBase: string, explicitPostsEndpoint: string): Promise<any[]> {
  for (const endpoint of buildInfoEndpoints(wpBase, explicitPostsEndpoint)) {
    try {
      const response = await fetch(`${endpoint}${endpoint.includes('?') ? '&' : '?'}t=${Date.now()}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) continue;

      const payload = await response.json();
      if (Array.isArray(payload)) return payload;
    } catch {
      continue;
    }
  }

  return [];
}
