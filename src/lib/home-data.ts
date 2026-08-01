import type {
  HomeDataResponse,
  HomeMediaItem,
  HomeMonitorData,
  HomeSourceProvider,
} from '../types/home';
import { hairStyles, photoGallery } from '../data/siteData';
import { fetchHomeFeed } from './content-api';

const DEFAULT_HAIR_LINK = 'https://www.instagram.com/lab.hair.design';
const DEFAULT_PHOTO_LINK = 'https://www.instagram.com/vietnam_lab_fashion';

const DEFAULT_MAIN_SECONDS = 8;
const DEFAULT_MONITOR_SECONDS = 6;
const DEFAULT_MONITOR_COUNT = 4;
const DEFAULT_MONITOR_GAP_PX = 4;
const DEFAULT_MONITOR_GRID_COLUMNS = 2;

function toNonEmptyString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toBoundedInt(value: unknown, fallback: number, min: number, max: number): number {
  const numeric = Math.round(toNumber(value, fallback));
  return Math.min(max, Math.max(min, numeric));
}

function toBoundedSeconds(value: unknown, fallback: number): number {
  const numeric = toNumber(value, fallback);
  const bounded = Math.min(30, Math.max(2, numeric));
  return Math.round(bounded * 10) / 10;
}

function toBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0') return false;
  }
  return fallback;
}

function toUrl(value: unknown): string {
  const raw = toNonEmptyString(value);
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  return '';
}

function toMediaUrl(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';

  const objectValue = value as Record<string, unknown>;
  return (
    toNonEmptyString(objectValue.url) ||
    toNonEmptyString(objectValue.src) ||
    toNonEmptyString(objectValue.image) ||
    toNonEmptyString(objectValue.mediaUrl)
  );
}

function normalizeMediaItems(value: unknown, fallback: HomeMediaItem[], prefix: string): HomeMediaItem[] {
  if (!Array.isArray(value)) return fallback;

  const normalized = value
    .map((item, index) => {
      if (typeof item === 'string') {
        const url = item.trim();
        if (!url) return null;
        return {
          id: `${prefix}-${index + 1}`,
          url,
          sortOrder: index + 1,
        } satisfies HomeMediaItem;
      }

      if (!item || typeof item !== 'object') return null;

      const objectItem = item as Record<string, unknown>;
      const url = toMediaUrl(objectItem.url ?? objectItem.src ?? objectItem.image ?? objectItem.mediaUrl ?? objectItem);
      if (!url) return null;

      const id =
        toNonEmptyString(objectItem.id) ||
        toNonEmptyString(objectItem.slug) ||
        `${prefix}-${index + 1}`;

      const alt = toNonEmptyString(objectItem.alt ?? objectItem.title ?? objectItem.caption);
      const sortOrder = toBoundedInt(objectItem.sortOrder ?? objectItem.order ?? index + 1, index + 1, 0, 9999);

      return {
        id,
        url,
        alt: alt || undefined,
        sortOrder,
      } satisfies HomeMediaItem;
    })
    .filter((item): item is HomeMediaItem => Boolean(item))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return normalized.length ? normalized : fallback;
}

function buildLocalFallback(): HomeDataResponse {
  const mainVisualItems: HomeMediaItem[] = hairStyles.slice(0, 6).map((item, index) => ({
    id: item.slug || `main-${index + 1}`,
    url: item.image,
    alt: item.title,
    sortOrder: index + 1,
  }));

  const hairItems: HomeMediaItem[] = hairStyles.map((item, index) => ({
    id: item.slug || `hair-${index + 1}`,
    url: item.image,
    alt: item.title,
    sortOrder: index + 1,
  }));

  const photoItems: HomeMediaItem[] = photoGallery.map((item, index) => ({
    id: item.slug || `photo-${index + 1}`,
    url: item.image,
    alt: item.title,
    sortOrder: index + 1,
  }));

  return {
    mainVisual: {
      items: mainVisualItems,
      transitionSeconds: DEFAULT_MAIN_SECONDS,
      effect: 'fade',
      loop: true,
      randomize: true,
    },
    hairMonitor: {
      items: hairItems,
      displayCount: DEFAULT_MONITOR_COUNT,
      gridColumns: DEFAULT_MONITOR_GRID_COLUMNS,
      gapPx: DEFAULT_MONITOR_GAP_PX,
      transitionSeconds: DEFAULT_MONITOR_SECONDS,
      randomize: true,
      linkUrl: DEFAULT_HAIR_LINK,
    },
    photoMonitor: {
      items: photoItems,
      displayCount: DEFAULT_MONITOR_COUNT,
      gridColumns: DEFAULT_MONITOR_GRID_COLUMNS,
      gapPx: DEFAULT_MONITOR_GAP_PX,
      transitionSeconds: DEFAULT_MONITOR_SECONDS,
      randomize: true,
      linkUrl: DEFAULT_PHOTO_LINK,
    },
    links: {
      hairInstagramUrl: DEFAULT_HAIR_LINK,
      photoInstagramUrl: DEFAULT_PHOTO_LINK,
    },
    source: {
      provider: 'local',
      fallbackApplied: true,
    },
  };
}

async function buildManagedFallback(): Promise<HomeDataResponse> {
  const local = buildLocalFallback();

  try {
    const feed = await fetchHomeFeed();

    const mainVisualItems = normalizeMediaItems(feed.sliderImages, local.mainVisual.items, 'main');
    const hairItems = normalizeMediaItems(feed.salonInstagramImages, local.hairMonitor.items, 'hair');
    const photoItems = normalizeMediaItems(feed.vietnamInstagramImages, local.photoMonitor.items, 'photo');

    const sourceProvider: HomeSourceProvider = 'wordpress';

    return {
      mainVisual: {
        ...local.mainVisual,
        items: mainVisualItems,
      },
      hairMonitor: {
        ...local.hairMonitor,
        items: hairItems,
        linkUrl: toUrl(feed.salonInstagramUrl) || local.hairMonitor.linkUrl,
      },
      photoMonitor: {
        ...local.photoMonitor,
        items: photoItems,
        linkUrl: toUrl(feed.vietnamInstagramUrl) || local.photoMonitor.linkUrl,
      },
      links: {
        hairInstagramUrl: toUrl(feed.salonInstagramUrl) || local.links.hairInstagramUrl,
        photoInstagramUrl: toUrl(feed.vietnamInstagramUrl) || local.links.photoInstagramUrl,
      },
      source: {
        provider: sourceProvider,
        fallbackApplied: false,
      },
    };
  } catch {
    return local;
  }
}

function buildWordPressEndpoints(): string[] {
  const explicit = toNonEmptyString(import.meta.env.WORDPRESS_HOME_CONTENT_URL);
  const baseCandidates = [
    import.meta.env.WORDPRESS_BASE_URL,
    import.meta.env.PUBLIC_WORDPRESS_BASE_URL,
    import.meta.env.PUBLIC_SITE_URL,
    'https://lab-hair-design.com',
    'https://www.lab-hair-design.com',
  ]
    .filter(Boolean)
    .map((value) => String(value).replace(/\/$/, ''));

  const endpoints = [
    explicit,
    ...baseCandidates.map((base) => `${base}/wp-json/lab/v1/home-content`),
    ...baseCandidates.map((base) => `${base}/index.php/wp-json/lab/v1/home-content`),
    ...baseCandidates.map((base) => `${base}/wordpress/wp-json/lab/v1/home-content`),
  ];

  return endpoints.filter(Boolean).filter((value, index, array) => array.indexOf(value) === index);
}

function resolveMonitorConfig(
  payloadMonitor: Record<string, unknown> | undefined,
  baseMonitor: HomeMonitorData,
  payloadRoot: Record<string, unknown>,
  keyPrefix: 'hair' | 'photo',
): HomeMonitorData {
  const displayCount = toBoundedInt(
    payloadMonitor?.displayCount ?? payloadMonitor?.monitor_count ?? payloadRoot[`${keyPrefix}MonitorCount`],
    baseMonitor.displayCount,
    1,
    12,
  );

  const gridColumns = toBoundedInt(
    payloadMonitor?.gridColumns ?? payloadRoot[`${keyPrefix}GridColumns`],
    baseMonitor.gridColumns,
    1,
    6,
  );

  const gapPx = toBoundedInt(
    payloadMonitor?.gapPx ?? payloadMonitor?.gap ?? payloadRoot[`${keyPrefix}GapPx`],
    baseMonitor.gapPx,
    0,
    64,
  );

  const transitionSeconds = toBoundedSeconds(
    payloadMonitor?.transitionSeconds ?? payloadRoot[`${keyPrefix}TransitionSeconds`],
    baseMonitor.transitionSeconds,
  );

  const randomize = toBoolean(
    payloadMonitor?.randomize ?? payloadRoot[`${keyPrefix}Randomize`],
    baseMonitor.randomize,
  );

  const linkUrl =
    toUrl(payloadMonitor?.linkUrl ?? payloadMonitor?.targetUrl ?? payloadRoot[`${keyPrefix}MonitorLink`]) ||
    baseMonitor.linkUrl;

  return {
    ...baseMonitor,
    displayCount,
    gridColumns,
    gapPx,
    transitionSeconds,
    randomize,
    linkUrl,
  };
}

function normalizeWordPressPayload(
  payload: unknown,
  fallback: HomeDataResponse,
  endpoint: string,
): HomeDataResponse {
  if (!payload || typeof payload !== 'object') {
    return {
      ...fallback,
      source: {
        ...fallback.source,
        endpoint,
        fallbackApplied: true,
      },
    };
  }

  const root = payload as Record<string, unknown>;
  const mainVisualSource =
    (root.mainVisual as Record<string, unknown> | undefined) ??
    (root.hero as Record<string, unknown> | undefined);
  const hairMonitorSource =
    (root.hairMonitor as Record<string, unknown> | undefined) ??
    (root.salonMonitor as Record<string, unknown> | undefined);
  const photoMonitorSource =
    (root.photoMonitor as Record<string, unknown> | undefined) ??
    (root.vietnamMonitor as Record<string, unknown> | undefined);

  const mainVisualItems = normalizeMediaItems(
    mainVisualSource?.items ?? mainVisualSource?.images ?? root.sliderImages,
    fallback.mainVisual.items,
    'main',
  );

  const hairItems = normalizeMediaItems(
    hairMonitorSource?.items ?? hairMonitorSource?.images ?? root.hairImages ?? root.salonInstagramImages,
    fallback.hairMonitor.items,
    'hair',
  );

  const photoItems = normalizeMediaItems(
    photoMonitorSource?.items ?? photoMonitorSource?.images ?? root.photoImages ?? root.vietnamInstagramImages,
    fallback.photoMonitor.items,
    'photo',
  );

  const mainTransition = toBoundedSeconds(
    mainVisualSource?.transitionSeconds ?? root.mainVisualTransitionSeconds,
    fallback.mainVisual.transitionSeconds,
  );

  const hairMonitor = resolveMonitorConfig(hairMonitorSource, fallback.hairMonitor, root, 'hair');
  const photoMonitor = resolveMonitorConfig(photoMonitorSource, fallback.photoMonitor, root, 'photo');

  const hairLink =
    toUrl(root.hairInstagramUrl ?? root.salonInstagramUrl ?? hairMonitor.linkUrl) || fallback.links.hairInstagramUrl;
  const photoLink =
    toUrl(root.photoInstagramUrl ?? root.vietnamInstagramUrl ?? photoMonitor.linkUrl) ||
    fallback.links.photoInstagramUrl;

  return {
    mainVisual: {
      ...fallback.mainVisual,
      items: mainVisualItems,
      transitionSeconds: mainTransition,
      randomize: toBoolean(mainVisualSource?.randomize ?? root.mainVisualRandomize, fallback.mainVisual.randomize),
      loop: toBoolean(mainVisualSource?.loop ?? root.mainVisualLoop, fallback.mainVisual.loop),
    },
    hairMonitor: {
      ...hairMonitor,
      items: hairItems,
      linkUrl: hairLink,
    },
    photoMonitor: {
      ...photoMonitor,
      items: photoItems,
      linkUrl: photoLink,
    },
    links: {
      hairInstagramUrl: hairLink,
      photoInstagramUrl: photoLink,
    },
    source: {
      provider: 'wordpress',
      endpoint,
      fallbackApplied: false,
    },
  };
}

async function fetchWordPressHomeData(fallback: HomeDataResponse): Promise<HomeDataResponse | null> {
  const endpoints = buildWordPressEndpoints();
  if (!endpoints.length) return null;

  for (const endpoint of endpoints) {
    try {
      const endpointWithTs = `${endpoint}${endpoint.includes('?') ? '&' : '?'}t=${Date.now()}`;
      const response = await fetch(endpointWithTs, {
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) continue;

      const payload = (await response.json()) as unknown;
      return normalizeWordPressPayload(payload, fallback, endpoint);
    } catch {
      continue;
    }
  }

  return null;
}

export async function getHomeData(): Promise<HomeDataResponse> {
  const managedFallback = await buildManagedFallback();

  try {
    const wordpressData = await fetchWordPressHomeData(managedFallback);
    if (wordpressData) return wordpressData;

    return {
      ...managedFallback,
      source: {
        ...managedFallback.source,
        fallbackApplied: true,
      },
    };
  } catch {
    return {
      ...managedFallback,
      source: {
        ...managedFallback.source,
        fallbackApplied: true,
      },
    };
  }
}
