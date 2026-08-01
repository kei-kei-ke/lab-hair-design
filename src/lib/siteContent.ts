import type { SiteContent } from '../types/site';
import {
  accessPage,
  hairStyles,
  homeInfo,
  infoEntries,
  instagramFeed,
  photoGallery,
  priceHighlights,
  priceSections,
  recruitPage,
  salon,
  shopPage,
  shopCareItems,
  staffMembers,
  styleCategories,
} from '../data/siteData';

const fallbackContent: SiteContent = {
  salon,
  staffMembers: [...staffMembers],
  styleCategories: [...styleCategories],
  hairStyles: [...hairStyles],
  homeInfo: [...homeInfo],
  infoEntries: [...infoEntries],
  priceSections: [...priceSections],
  priceHighlights: [...priceHighlights],
  shopCareItems: [...shopCareItems],
  photoGallery: [...photoGallery],
  accessPage: { ...accessPage },
  recruitPage: { ...recruitPage },
  shopPage: { ...shopPage },
  instagramFeed: [...instagramFeed],
};

function sanitizeArray<T>(value: T[] | undefined, fallback: T[]): T[] {
  return Array.isArray(value) && value.length > 0 ? value : fallback;
}

function mergeContent(payload: Partial<SiteContent>): SiteContent {
  return {
    salon: { ...fallbackContent.salon, ...(payload.salon ?? {}) },
    staffMembers: sanitizeArray(payload.staffMembers, fallbackContent.staffMembers),
    styleCategories: sanitizeArray(payload.styleCategories, fallbackContent.styleCategories),
    hairStyles: sanitizeArray(payload.hairStyles, fallbackContent.hairStyles),
    homeInfo: sanitizeArray(payload.homeInfo, fallbackContent.homeInfo),
    infoEntries: sanitizeArray(payload.infoEntries, fallbackContent.infoEntries),
    priceSections: sanitizeArray(payload.priceSections, fallbackContent.priceSections),
    priceHighlights: sanitizeArray(payload.priceHighlights, fallbackContent.priceHighlights),
    shopCareItems: sanitizeArray(payload.shopCareItems, fallbackContent.shopCareItems),
    photoGallery: sanitizeArray(payload.photoGallery, fallbackContent.photoGallery ?? []),
    accessPage: { ...fallbackContent.accessPage, ...(payload.accessPage ?? {}) },
    recruitPage: { ...fallbackContent.recruitPage, ...(payload.recruitPage ?? {}) },
    shopPage: { ...fallbackContent.shopPage, ...(payload.shopPage ?? {}) },
    instagramFeed: sanitizeArray(payload.instagramFeed, fallbackContent.instagramFeed ?? []),
  };
}

async function fetchWordPressContent(): Promise<SiteContent | null> {
  const envEndpoint = import.meta.env.WORDPRESS_SITE_CONTENT_URL;
  const baseCandidates = [
    import.meta.env.WORDPRESS_BASE_URL,
    import.meta.env.PUBLIC_WORDPRESS_BASE_URL,
    import.meta.env.PUBLIC_SITE_URL,
    'https://lab-hair-design.com',
    'https://www.lab-hair-design.com',
  ]
    .filter(Boolean)
    .map((value) => String(value).replace(/\/$/, ''));

  const endpointCandidates = [
    envEndpoint,
    ...baseCandidates.map((base) => `${base}/wp-json/lab/v1/site-content`),
    ...baseCandidates.map((base) => `${base}/index.php/wp-json/lab/v1/site-content`),
    ...baseCandidates.map((base) => `${base}/wordpress/wp-json/lab/v1/site-content`),
  ]
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index) as string[];

  if (endpointCandidates.length === 0) {
    return null;
  }

  let lastError: Error | null = null;

  for (const endpoint of endpointCandidates) {
    try {
      const endpointWithTs = `${endpoint}${endpoint.includes('?') ? '&' : '?'}t=${Date.now()}`;
      const response = await fetch(endpointWithTs, {
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch WordPress content from ${endpoint}: ${response.status}`);
      }

      const payload = (await response.json()) as Partial<SiteContent>;
      return mergeContent(payload);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError ?? new Error('Failed to fetch WordPress content from all candidates.');
}

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const wordpressContent = await fetchWordPressContent();
    return wordpressContent ?? fallbackContent;
  } catch (error) {
    console.warn('[siteContent] Falling back to local content.', error);
    return fallbackContent;
  }
}
