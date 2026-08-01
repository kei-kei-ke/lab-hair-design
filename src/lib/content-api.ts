import type { HairStyle, PhotoGalleryItem, PriceSection, StaffMember } from '../types/site';
import {
  salon as fallbackSalonData,
  hairStyles as fallbackHairStyles,
  photoGallery as fallbackPhotoGallery,
  priceSections as fallbackPriceSections,
  shopPage as fallbackShopPage,
  staffMembers as fallbackStaffMembers,
  infoEntries as fallbackInfoEntries,
} from '../data/siteData';
import { getSiteContent } from './siteContent';

type HomeFeed = {
  sliderImages: string[];
  salonInstagramImages: string[];
  vietnamInstagramImages: string[];
  salonInstagramUrl: string;
  vietnamInstagramUrl: string;
  footerSalonInfo: {
    name: string;
    address: string;
    tel: string;
    hours: string;
    closed: string;
    extraLines: string[];
  };
};

type RecruitConditionItem = {
  label: string;
  text: string;
  menuOrder?: number;
};

type RecruitContent = {
  title: string;
  bodyParagraphs: string[];
  conditions: RecruitConditionItem[];
};

type ShopCard = {
  label: string;
  title: string;
  price: string;
  text: string;
  image?: string;
  link?: string;
  menuOrder?: number;
};

type ShopContent = {
  title: string;
  line1: string;
  line2: string;
  cards: ShopCard[];
};

export type AccessContent = {
  address: string;
  guide: string;
  hours: string;
  closed: string;
  tel: string;
  mapQuery: string;
};

export type StaffMessageContent = {
  title: string;
  paragraphs: string[];
};

export type InfoPost = {
  id: string;
  slug: string;
  title: string;
  date: string;
  content: string;
  excerpt: string;
  thumbnail?: string;
  category?: string;
};

type GalleryTile = {
  slug: string;
  title: string;
  image: string;
  caption?: string;
  category: 'hair' | 'photo';
  date?: string;
};

export type GalleryFeed = {
  hair: GalleryTile[];
  photo: GalleryTile[];
};

const defaultSalonInstagramUrl = 'https://www.instagram.com/lab.hair.design';
const defaultVietnamInstagramUrl = 'https://www.instagram.com/vietnam_lab_fashion';
const defaultRecruitTitle = 'Quiet craft, honest growth.';
const defaultRecruitBody = [
  '広い世界で感性を磨き、知性を育む。',
  '私たちは、技術を磨くだけの場所ではありません。個々の成長にどこまでも投資するサロンです。社会保障としての投資ではなく、本人が望めば働きながら大学に通って知性を深めるチャンスも、海外へ飛び出して新しい世界で経験を積むチャンスも、私たちは本気でその成長機会を提供します。',
];
const defaultRecruitConditions: RecruitConditionItem[] = [
  { label: '雇用形態', text: '正社員 / 契約社員 / 業務委託 応相談', menuOrder: 1 },
  { label: '勤務地', text: '〒422-8067 静岡県静岡市駿河区南町7-9 サウスパラシオン2階', menuOrder: 2 },
  { label: '勤務時間', text: '平日 10:00 — 20:00 / 土日祝 10:00 — 19:00', menuOrder: 3 },
  { label: '休日', text: '月6〜7日、年末年始休暇あり', menuOrder: 4 },
  { label: '給与', text: '技術レベル・能力に応じて変動、相談のうえ決定', menuOrder: 5 },
  { label: '待遇', text: '個々の成長を重視した教育、外部講習や技術面談など必要に応じて対応', menuOrder: 6 },
  { label: '応募方法', text: '店頭またはお気軽にお問い合わせください。', menuOrder: 7 },
];

function toImageUrl(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;

  if (typeof value === 'object') {
    const candidate = value as Record<string, unknown>;
    if (typeof candidate.url === 'string') return candidate.url;
    if (typeof candidate.src === 'string') return candidate.src;
    if (typeof candidate.image === 'string') return candidate.image;

    if (candidate.image && typeof candidate.image === 'object') {
      const nested = candidate.image as Record<string, unknown>;
      if (typeof nested.url === 'string') return nested.url;
      if (typeof nested.src === 'string') return nested.src;
    }
  }

  return '';
}

function toImageArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => toImageUrl(item)).filter(Boolean);
}

function toNonEmptyString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function toNonEmptyStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => toNonEmptyString(item)).filter(Boolean);
}

function normalizeHomeFeed(payload: unknown): HomeFeed {
  const fallbackSalonImages = fallbackHairStyles.map((item) => item.image).filter(Boolean);
  const fallbackVietnam = fallbackPhotoGallery.map((item) => item.image).filter(Boolean);
  const fallbackFooterInfo: HomeFeed['footerSalonInfo'] = {
    name: fallbackSalonData.name || 'Lab hair design',
    address: fallbackSalonData.address,
    tel: '054-202-7130',
    hours: fallbackSalonData.hours,
    closed: fallbackSalonData.closed,
    extraLines: [],
  };

  if (!payload || typeof payload !== 'object') {
    return {
      sliderImages: fallbackSalonImages.slice(0, 6),
      salonInstagramImages: fallbackSalonImages,
      vietnamInstagramImages: fallbackVietnam,
      salonInstagramUrl: defaultSalonInstagramUrl,
      vietnamInstagramUrl: defaultVietnamInstagramUrl,
      footerSalonInfo: fallbackFooterInfo,
    };
  }

  const source = payload as Record<string, unknown>;
  const sliderImages = toImageArray(source.sliderImages);

  // Accept either split arrays or a single instagramImages array with optional side metadata.
  const salonFromSplit = toImageArray(source.salonInstagramImages);
  const vietnamFromSplit = toImageArray(source.vietnamInstagramImages);

  let salonInstagramImages = salonFromSplit;
  let vietnamInstagramImages = vietnamFromSplit;

  if (!salonInstagramImages.length || !vietnamInstagramImages.length) {
    const generic = Array.isArray(source.instagramImages)
      ? (source.instagramImages as unknown[])
      : [];

    const left: string[] = [];
    const right: string[] = [];

    generic.forEach((item) => {
      const image = toImageUrl(item);
      if (!image) return;

      if (item && typeof item === 'object') {
        const entry = item as Record<string, unknown>;
        const side = String(entry.side ?? entry.category ?? '').toLowerCase();
        if (side.includes('left') || side.includes('salon')) {
          left.push(image);
          return;
        }
        if (side.includes('right') || side.includes('vietnam')) {
          right.push(image);
          return;
        }
      }

      // If side metadata is absent, alternate to keep the 6x2 split usable.
      if ((left.length + right.length) % 2 === 0) {
        left.push(image);
      } else {
        right.push(image);
      }
    });

    salonInstagramImages = salonInstagramImages.length ? salonInstagramImages : left;
    vietnamInstagramImages = vietnamInstagramImages.length ? vietnamInstagramImages : right;
  }

  const salonInstagramUrl =
    typeof source.salonInstagramUrl === 'string' && source.salonInstagramUrl
      ? source.salonInstagramUrl
      : defaultSalonInstagramUrl;
  const vietnamInstagramUrl =
    typeof source.vietnamInstagramUrl === 'string' && source.vietnamInstagramUrl
      ? source.vietnamInstagramUrl
      : defaultVietnamInstagramUrl;

  const footerSource =
    (source.footerSalonInfo as Record<string, unknown> | undefined) ??
    (source.salonInfo as Record<string, unknown> | undefined) ??
    source;

  const footerExtraLines =
    toNonEmptyStringArray(footerSource.extraLines ?? footerSource.lines ?? footerSource.footerExtraLines) || [];

  const footerNoteText = toNonEmptyString(footerSource.notes ?? footerSource.footerNotes ?? source.footerNotes);
  const notesAsLines = footerNoteText
    ? footerNoteText.split('\n').map((line) => line.trim()).filter(Boolean)
    : [];

  const footerSalonInfo: HomeFeed['footerSalonInfo'] = {
    name:
      toNonEmptyString(footerSource.name ?? footerSource.salonName ?? source.footerSalonName) ||
      fallbackFooterInfo.name,
    address:
      toNonEmptyString(footerSource.address ?? footerSource.salonAddress ?? source.footerAddress) ||
      fallbackFooterInfo.address,
    tel:
      toNonEmptyString(
        footerSource.tel ?? footerSource.phone ?? footerSource.telephone ?? source.footerTel ?? source.footerPhone,
      ) || fallbackFooterInfo.tel,
    hours:
      toNonEmptyString(footerSource.hours ?? footerSource.businessHours ?? source.footerHours) ||
      fallbackFooterInfo.hours,
    closed:
      toNonEmptyString(footerSource.closed ?? footerSource.holiday ?? footerSource.closedDay ?? source.footerClosed) ||
      fallbackFooterInfo.closed,
    extraLines: [...footerExtraLines, ...notesAsLines],
  };

  return {
    sliderImages: sliderImages.length ? sliderImages : fallbackSalonImages.slice(0, 6),
    salonInstagramImages: salonInstagramImages.length ? salonInstagramImages : fallbackSalonImages,
    vietnamInstagramImages: vietnamInstagramImages.length ? vietnamInstagramImages : fallbackVietnam,
    salonInstagramUrl,
    vietnamInstagramUrl,
    footerSalonInfo,
  };
}

export async function fetchHomeFeed(): Promise<HomeFeed> {
  try {
    const content = await getSiteContent();
    return normalizeHomeFeed({
      sliderImages: content.hairStyles?.map((item) => item.image).filter(Boolean) ?? [],
      salonInstagramImages: content.hairStyles?.map((item) => item.image).filter(Boolean) ?? [],
      vietnamInstagramImages: content.photoGallery?.map((item) => item.image).filter(Boolean) ?? [],
      salonInstagramUrl: content.salon?.instagramUrl,
      vietnamInstagramUrl: content.salon?.instagramUrl,
      footerSalonInfo: {
        name: content.salon?.name,
        address: content.salon?.address,
        tel: content.salon?.telPageUrl,
        hours: content.salon?.hours,
        closed: content.salon?.closed,
        extraLines: content.salon?.accessGuide,
      },
    });
  } catch (error) {
    console.warn('[content] Failed to fetch home feed from WordPress. Falling back to local data.', error);
    return normalizeHomeFeed(null);
  }
}

type GalleryPageOptions = {
  limit?: number;
  offset?: number;
};

function mapFallbackHairItems(): HairStyle[] {
  return [...fallbackHairStyles].map((item) => ({
    slug: item.slug,
    title: item.title,
    stylist: item.stylist,
    category: item.category,
    image: item.image,
  })) satisfies HairStyle[];
}

function mapFallbackPhotoItems(): PhotoGalleryItem[] {
  return [...fallbackPhotoGallery].map((item) => ({
    slug: item.slug,
    title: item.title,
    image: item.image,
    caption: item.caption,
  })) satisfies PhotoGalleryItem[];
}

function sliceByPage<T>(items: T[], options?: GalleryPageOptions): T[] {
  const offset = Math.max(0, options?.offset ?? 0);
  const limit = options?.limit;
  if (typeof limit !== 'number' || limit <= 0) return items.slice(offset);
  return items.slice(offset, offset + limit);
}

async function fetchWordPressGalleryItems(): Promise<{ hair: HairStyle[]; photo: PhotoGalleryItem[] }> {
  const content = await getSiteContent();

  const hair = (Array.isArray(content.hairStyles) ? content.hairStyles : [])
    .map((item, index) => ({
      slug: String(item.slug ?? '').trim() || `hair-${index + 1}`,
      title: String(item.title ?? '').trim() || `Hair ${index + 1}`,
      stylist: String(item.stylist ?? '').trim() || 'Lab',
      category: String(item.category ?? '').trim() || 'Hair',
      image: String(item.image ?? '').trim(),
    }))
    .filter((item) => item.image !== '');

  const photo = (Array.isArray(content.photoGallery) ? content.photoGallery : [])
    .map((item, index) => ({
      slug: String(item.slug ?? '').trim() || `photo-${index + 1}`,
      title: String(item.title ?? '').trim() || `Photo ${index + 1}`,
      image: String(item.image ?? '').trim(),
      caption: String(item.caption ?? '').trim() || undefined,
    }))
    .filter((item) => item.image !== '');

  return { hair, photo };
}

export async function fetchHairItems(options?: GalleryPageOptions): Promise<HairStyle[]> {
  const fallbackItems = mapFallbackHairItems();
  const fallbackPaged = sliceByPage(fallbackItems, options);

  try {
    const wordpressGallery = await fetchWordPressGalleryItems();
    if (wordpressGallery.hair.length) {
      return sliceByPage(wordpressGallery.hair, options);
    }
  } catch {
    // Continue to fallback below.
  }

  return fallbackPaged;
}

export async function fetchPhotoItems(options?: GalleryPageOptions): Promise<PhotoGalleryItem[]> {
  const fallbackItems = mapFallbackPhotoItems();
  const fallbackPaged = sliceByPage(fallbackItems, options);

  try {
    const wordpressGallery = await fetchWordPressGalleryItems();
    if (wordpressGallery.photo.length) {
      return sliceByPage(wordpressGallery.photo, options);
    }
  } catch {
    // Continue to fallback below.
  }

  return fallbackPaged;
}

function normalizePriceSections(payload: unknown): PriceSection[] {
  const asArray = Array.isArray(payload) ? payload : [];

  const sections = asArray
    .map((section, sectionIndex) => {
      if (!section || typeof section !== 'object') return null;
      const record = section as Record<string, unknown>;

      const category = String(record.category ?? record.title ?? record.name ?? '').trim();
      if (!category) return null;

      const rawItems = Array.isArray(record.items)
        ? record.items
        : Array.isArray(record.menus)
          ? record.menus
          : Array.isArray(record.children)
            ? record.children
            : [];

      const items = rawItems
        .map((item, itemIndex) => {
          if (!item || typeof item !== 'object') return null;
          const entry = item as Record<string, unknown>;

          const name = String(entry.name ?? entry.title ?? '').trim();
          if (!name) return null;

          const price = String(entry.price ?? '').trim();
          const note = String(entry.note ?? entry.description ?? '').trim();
          const menuOrder = Number.isFinite(Number(entry.menuOrder))
            ? Number(entry.menuOrder)
            : itemIndex;
          const createdAt = typeof entry.createdAt === 'string' ? entry.createdAt : undefined;

          return { name, price, note, menuOrder, createdAt };
        })
        .filter(Boolean) as PriceSection['items'];

      if (!items.length) return null;

      const menuOrder = Number.isFinite(Number(record.menuOrder)) ? Number(record.menuOrder) : sectionIndex;
      const createdAt = typeof record.createdAt === 'string' ? record.createdAt : undefined;

      return { category, menuOrder, createdAt, items } satisfies PriceSection;
    })
    .filter(Boolean) as PriceSection[];

  return sections;
}

function normalizeAccessContent(payload: unknown): AccessContent {
  const source = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  const accessSource =
    (source.access as Record<string, unknown> | undefined) ??
    (source.accessInfo as Record<string, unknown> | undefined) ??
    source;

  const address =
    toNonEmptyString(accessSource.address ?? accessSource.location ?? accessSource.salonAddress) ||
    '〒422-8067 静岡県静岡市駿河区南町7-9 サウスパラシオン2階';
  const guide =
    toNonEmptyString(accessSource.guide ?? accessSource.accessGuide ?? accessSource.stationAccess) ||
    '静岡駅 南口から徒歩3分';
  const hours =
    toNonEmptyString(accessSource.hours ?? accessSource.businessHours) ||
    '平日 10:00〜20:00 / 土日祝 10:00〜19:00';
  const closed =
    toNonEmptyString(accessSource.closed ?? accessSource.holiday) ||
    '第1・第3火曜定休、その他時期により不定休あり';
  const tel = toNonEmptyString(accessSource.tel ?? accessSource.phone ?? accessSource.telephone) || '054-202-7130';
  const mapQuery = toNonEmptyString(accessSource.mapQuery ?? address) || address;

  return { address, guide, hours, closed, tel, mapQuery };
}

export async function fetchAccessContent(): Promise<AccessContent> {
  try {
    const content = await getSiteContent();
    return normalizeAccessContent({
      access: {
        address: content.accessPage?.body,
        guide: content.salon?.accessSummary,
        hours: content.salon?.hours,
        closed: content.salon?.closed,
        tel: content.salon?.telPageUrl,
        mapQuery: content.accessPage?.body,
      },
    });
  } catch (error) {
    console.warn('[content] Failed to fetch access data from WordPress. Falling back to local data.', error);
  }

  return normalizeAccessContent(null);
}

export async function fetchPriceSections(): Promise<PriceSection[]> {
  try {
    const content = await getSiteContent();
    const objectSections = normalizePriceSections(content.priceSections);
    if (objectSections.length) return objectSections;
  } catch (error) {
    console.warn('[content] Failed to fetch price data from WordPress. Falling back to local data.', error);
  }

  return normalizePriceSections(fallbackPriceSections);
}

function normalizeRecruitConditions(source: unknown): RecruitConditionItem[] {
  const array = Array.isArray(source) ? source : [];
  const mapped = array
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const entry = item as Record<string, unknown>;
      const label = String(entry.label ?? entry.title ?? entry.name ?? '').trim();
      const text = String(entry.text ?? entry.value ?? entry.body ?? entry.description ?? '').trim();
      if (!label || !text) return null;
      const menuOrder = Number.isFinite(Number(entry.menuOrder)) ? Number(entry.menuOrder) : index + 1;
      return { label, text, menuOrder } satisfies RecruitConditionItem;
    })
    .filter(Boolean) as RecruitConditionItem[];

  if (!mapped.length) return [];
  return [...mapped].sort((a, b) => (a.menuOrder ?? Number.MAX_SAFE_INTEGER) - (b.menuOrder ?? Number.MAX_SAFE_INTEGER));
}

function normalizeRecruitContent(payload: unknown): RecruitContent {
  const fallback: RecruitContent = {
    title: defaultRecruitTitle,
    bodyParagraphs: [...defaultRecruitBody],
    conditions: [...defaultRecruitConditions],
  };

  if (!payload || typeof payload !== 'object') return fallback;
  const source = payload as Record<string, unknown>;

  const rawTitle = String(source.title ?? '').trim();
  const title = rawTitle || fallback.title;

  const rawBody = String(source.body ?? source.philosophy ?? '').trim();
  const bodyParagraphs = rawBody
    ? rawBody.split('\n').map((line) => line.trim()).filter(Boolean)
    : fallback.bodyParagraphs;

  let conditions = normalizeRecruitConditions(source.conditions);
  if (!conditions.length) {
    conditions = normalizeRecruitConditions(source.requirements);
  }

  // Alternate object model support: flat fields on recruit object.
  if (!conditions.length) {
    const flatConditions = [
      { label: '雇用形態', text: String(source.employmentType ?? '').trim(), menuOrder: 1 },
      { label: '勤務地', text: String(source.workLocation ?? source.location ?? '').trim(), menuOrder: 2 },
      { label: '勤務時間', text: String(source.workHours ?? '').trim(), menuOrder: 3 },
      { label: '休日', text: String(source.holidays ?? '').trim(), menuOrder: 4 },
      { label: '給与', text: String(source.salary ?? '').trim(), menuOrder: 5 },
      { label: '待遇', text: String(source.benefits ?? '').trim(), menuOrder: 6 },
      { label: '応募方法', text: String(source.applicationMethod ?? '').trim(), menuOrder: 7 },
    ].filter((item) => item.text);

    conditions = flatConditions.length ? flatConditions : fallback.conditions;
  }

  return {
    title,
    bodyParagraphs: bodyParagraphs.length ? bodyParagraphs : fallback.bodyParagraphs,
    conditions,
  };
}

export async function fetchRecruitContent(): Promise<RecruitContent> {
  try {
    const content = await getSiteContent();
    const normalized = normalizeRecruitContent({
      title: content.recruitPage?.title,
      body: content.recruitPage?.body,
    });
    if (normalized.bodyParagraphs.length || normalized.conditions.length) return normalized;
  } catch (error) {
    console.warn('[content] Failed to fetch recruit content from WordPress. Falling back to local data.', error);
  }

  return normalizeRecruitContent(null);
}

function normalizeShopCards(payload: unknown): ShopCard[] {
  const source = Array.isArray(payload) ? payload : [];
  const cards = source
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const entry = item as Record<string, unknown>;

      const label = String(entry.label ?? entry.category ?? '').trim();
      const title = String(entry.title ?? entry.name ?? '').trim();
      const price = String(entry.price ?? '').trim();
      const text = String(entry.text ?? entry.description ?? entry.body ?? '').trim();
      if (!title || !text) return null;

      const image = toImageUrl(entry.image ?? entry.thumbnail ?? entry.photo);
      const link = String(entry.link ?? entry.url ?? entry.permalink ?? '').trim();
      const menuOrder = Number.isFinite(Number(entry.menuOrder)) ? Number(entry.menuOrder) : index + 1;

      return {
        label: label || 'ITEM',
        title,
        price,
        text,
        image: image || undefined,
        link: link || undefined,
        menuOrder,
      } satisfies ShopCard;
    })
    .filter(Boolean) as ShopCard[];

  return cards.sort((a, b) => (a.menuOrder ?? Number.MAX_SAFE_INTEGER) - (b.menuOrder ?? Number.MAX_SAFE_INTEGER));
}

function normalizeShopContent(payload: unknown, cardsFromProducts?: ShopCard[]): ShopContent {
  const fallbackBodyLines = String(fallbackShopPage.body ?? '').split('\n').map((line) => line.trim()).filter(Boolean);
  const fallback: ShopContent = {
    title: fallbackShopPage.title || 'VIETNAM LOCAL BRAND',
    line1:
      fallbackBodyLines[0] ||
      '旅先で出会ったローカルの空気を、静かに紹介する小さなラインを準備しています。',
    line2:
      fallbackBodyLines[1] ||
      'オーナーが様々な場所で集めたお気に入りのアーティストグッズやキーホルダーが、ここに静かに並ぶ予定です。',
    cards: [],
  };

  const source = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null;
  if (!source) {
    return {
      ...fallback,
      cards: cardsFromProducts && cardsFromProducts.length ? cardsFromProducts : fallback.cards,
    };
  }

  const title = String(source.title ?? '').trim() || fallback.title;
  const body = String(source.body ?? '').trim();
  const bodyLines = body ? body.split('\n').map((line) => line.trim()).filter(Boolean) : [];
  const line1 = bodyLines[0] || fallback.line1;
  const line2 = bodyLines[1] || fallback.line2;

  const objectCards = normalizeShopCards(source.cards ?? source.items ?? source.products);
  const cards = objectCards.length
    ? objectCards
    : cardsFromProducts && cardsFromProducts.length
      ? cardsFromProducts
      : [];

  return { title, line1, line2, cards };
}

export async function fetchShopContent(): Promise<ShopContent> {
  try {
    const content = await getSiteContent();
    return normalizeShopContent(
      {
        title: content.shopPage?.title,
        body: content.shopPage?.body,
      },
      normalizeShopCards(content.shopCareItems),
    );
  } catch (error) {
    console.warn('[content] Failed to fetch shop content from WordPress. Falling back to local data.', error);
  }

  return normalizeShopContent(null, []);
}

function normalizeStaffMembers(payload: unknown): StaffMember[] {
  const source = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object'
      ? (Array.isArray((payload as Record<string, unknown>).members)
          ? ((payload as Record<string, unknown>).members as unknown[])
          : Array.isArray((payload as Record<string, unknown>).staffMembers)
            ? ((payload as Record<string, unknown>).staffMembers as unknown[])
            : [])
      : [];
  const members = source
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const entry = item as Record<string, unknown>;

      const image = toImageUrl(entry.image ?? entry.thumbnail ?? entry.photo);
      const name = String(entry.name ?? entry.title ?? '').trim();
      if (!image || !name) return null;

      const slug = String(entry.slug ?? entry.id ?? `staff-${index + 1}`);
      const kana = String(entry.kana ?? '').trim();
      const role = String(entry.role ?? entry.position ?? '').trim() || 'Staff';
      const history = String(entry.history ?? '').trim();
      const profile = String(entry.profile ?? entry.bio ?? entry.description ?? '').trim();

      return { slug, name, kana, role, history, profile, image } satisfies StaffMember;
    })
    .filter(Boolean) as StaffMember[];

  return members;
}

function normalizeStaffMessage(payload: unknown): StaffMessageContent {
  const fallbackText =
    '一人ひとりの髪質やライフスタイルに向き合い、長く信頼される技術と接客を積み重ねていきます。';
  const fallback: StaffMessageContent = {
    title: 'Owner Message',
    paragraphs: [fallbackText],
  };

  if (!payload || typeof payload !== 'object') return fallback;
  const source = payload as Record<string, unknown>;

  const title =
    toNonEmptyString(source.messageTitle ?? source.ownerMessageTitle ?? source.philosophyTitle ?? source.title) ||
    fallback.title;

  const textValue = toNonEmptyString(
    source.message ??
      source.ownerMessage ??
      source.philosophy ??
      source.corporatePhilosophy ??
      source.mission ??
      source.concept,
  );
  const paragraphsFromText = textValue
    ? textValue.split('\n').map((line) => line.trim()).filter(Boolean)
    : [];

  const linesFromArray = toNonEmptyStringArray(
    source.messageLines ?? source.ownerMessageLines ?? source.philosophyLines,
  );

  const paragraphs = [...paragraphsFromText, ...linesFromArray]
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line, index, array) => array.indexOf(line) === index);

  return {
    title,
    paragraphs: paragraphs.length ? paragraphs : fallback.paragraphs,
  };
}

export async function fetchStaffMembers(): Promise<StaffMember[]> {
  try {
    const content = await getSiteContent();
    const normalized = normalizeStaffMembers(content.staffMembers);
    if (normalized.length) return normalized;
  } catch {
    // Continue with local fallback.
  }

  return [...fallbackStaffMembers];
}

export async function fetchStaffMessage(): Promise<StaffMessageContent> {
  try {
    const content = await getSiteContent();
    const normalized = normalizeStaffMessage((content.staffMembers ?? [])[0]);
    if (normalized.paragraphs.length) return normalized;
  } catch (error) {
    console.warn('[content] Failed to fetch staff message from WordPress. Falling back to local data.', error);
  }

  return normalizeStaffMessage(null);
}

function normalizeInfoPosts(payload: unknown): InfoPost[] {
  const source = Array.isArray(payload) ? payload : [];
  const posts = source
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const entry = item as Record<string, unknown>;

      const id = String(entry.id ?? entry.slug ?? `info-${index + 1}`).trim();
      const slug = String(entry.slug ?? id).trim();
      const title = String(entry.title ?? entry.name ?? '').trim();
      const content = String(entry.content ?? entry.body ?? '').trim();
      const excerpt = String(entry.excerpt ?? '').trim();
      const date = String(entry.publishedAt ?? entry.createdAt ?? entry.date ?? '').trim();
      const thumbnail = toImageUrl(entry.thumbnail ?? entry.image ?? entry.eyecatch);
      const category = String(entry.category ?? entry.type ?? '').trim().toLowerCase();

      if (!title) return null;

      return {
        id,
        slug,
        title,
        date,
        content,
        excerpt,
        thumbnail: thumbnail || undefined,
        category: category || undefined,
      } satisfies InfoPost;
    })
    .filter(Boolean) as InfoPost[];

  return posts.sort((a, b) => Date.parse(b.date || '') - Date.parse(a.date || ''));
}

function fallbackInfoPosts(): InfoPost[] {
  return fallbackInfoEntries.map((entry, index) => ({
    id: `fallback-info-${index + 1}`,
    slug: `fallback-info-${index + 1}`,
    title: entry.title,
    date: '',
    content: String((entry as { body?: string; text?: string }).body ?? entry.text ?? '').trim(),
    excerpt: String((entry as { body?: string; text?: string }).body ?? entry.text ?? '').trim(),
    thumbnail: toImageUrl((entry as { image?: string }).image) || undefined,
  }));
}

export async function fetchInfoPosts(): Promise<InfoPost[]> {
  try {
    const content = await getSiteContent();
    const normalized = normalizeInfoPosts(content.infoEntries);
    if (normalized.length) return normalized;
  } catch {
    // Continue with local fallback.
  }

  return fallbackInfoPosts();
}

function normalizeGalleryCategory(value: unknown): 'hair' | 'photo' | '' {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized.includes('hair')) return 'hair';
  if (normalized.includes('photo')) return 'photo';
  return '';
}

function normalizeGalleryFeed(payload: unknown): GalleryFeed {
  const fallbackHair = [...fallbackHairStyles]
    .map((item) => ({
      slug: item.slug,
      title: item.title,
      image: item.image,
      category: 'hair' as const,
    }))
    .slice(0, 4);

  const fallbackPhoto = [...fallbackPhotoGallery]
    .map((item) => ({
      slug: item.slug,
      title: item.title,
      image: item.image,
      caption: item.caption,
      category: 'photo' as const,
    }))
    .slice(0, 4);

  const source = Array.isArray(payload) ? payload : [];
  const mapped = source
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const entry = item as Record<string, unknown>;
      const image = toImageUrl(entry.image ?? entry.thumbnail ?? entry.photo);
      if (!image) return null;

      const category = normalizeGalleryCategory(entry.category ?? entry.type ?? entry.group);
      if (!category) return null;

      return {
        slug: String(entry.slug ?? entry.id ?? `gallery-${index + 1}`),
        title: String(entry.title ?? entry.name ?? category.toUpperCase()),
        image,
        caption: String(entry.caption ?? '').trim() || undefined,
        category,
        date: String(entry.publishedAt ?? entry.createdAt ?? '').trim() || undefined,
      } satisfies GalleryTile;
    })
    .filter(Boolean) as GalleryTile[];

  const sortByDateDesc = (left: GalleryTile, right: GalleryTile) =>
    Date.parse(right.date || '') - Date.parse(left.date || '');

  const hair = mapped.filter((item) => item.category === 'hair').sort(sortByDateDesc);
  const photo = mapped.filter((item) => item.category === 'photo').sort(sortByDateDesc);

  return {
    hair: hair.length ? hair : fallbackHair,
    photo: photo.length ? photo : fallbackPhoto,
  };
}

export async function fetchGalleryFeed(): Promise<GalleryFeed> {
  try {
    const wordpressGallery = await fetchWordPressGalleryItems();
    if (wordpressGallery.hair.length || wordpressGallery.photo.length) {
      return {
        hair: wordpressGallery.hair.map((item) => ({
          slug: item.slug,
          title: item.title,
          image: item.image,
          category: 'hair',
        })),
        photo: wordpressGallery.photo.map((item) => ({
          slug: item.slug,
          title: item.title,
          image: item.image,
          caption: item.caption,
          category: 'photo',
        })),
      };
    }
  } catch {
    // Continue to fallback below.
  }

  return normalizeGalleryFeed(null);
}
