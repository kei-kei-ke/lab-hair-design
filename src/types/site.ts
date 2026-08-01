export interface SalonInfo {
  name: string;
  kana: string;
  instagramUrl: string;
  hotpepperUrl: string;
  bookingUrl: string;
  telPageUrl: string;
  address: string;
  accessSummary: string;
  accessGuide: string[];
  hours: string;
  lastReception: string;
  closed: string;
  stationAccess: string;
  parking: string;
  payment: string;
  cutPrice: string;
  seats: string;
  staffCount: string;
  rating: string;
  reviewCount: string;
  lead: string;
  intro: string;
  features: string[];
}

export interface StaffMember {
  slug: string;
  name: string;
  kana: string;
  role: string;
  history: string;
  profile: string;
  image: string;
}

export interface HairStyle {
  slug: string;
  title: string;
  stylist: string;
  category: string;
  image: string;
}

export interface InfoEntry {
  label: string;
  title: string;
  body?: string;
  text?: string;
  image?: string;
}

export interface PriceItem {
  name: string;
  price: string;
  note: string;
  menuOrder?: number;
  createdAt?: string;
}

export interface PriceSection {
  category: string;
  menuOrder?: number;
  createdAt?: string;
  items: PriceItem[];
}

export interface PriceHighlight {
  label: string;
  title: string;
  price: string;
  text: string;
}

export interface ShopCareItem {
  label: string;
  title: string;
  price: string;
  text: string;
}

export interface PhotoGalleryItem {
  slug: string;
  title: string;
  image: string;
  caption?: string;
}

export interface ManagedPageContent {
  slug: string;
  title: string;
  body: string;
  excerpt?: string;
  image?: string;
}

export interface InstagramFeedItem {
  id: string;
  permalink: string;
  mediaUrl: string;
  caption?: string;
  timestamp?: string;
  username?: string;
}

export interface SiteContent {
  salon: SalonInfo;
  staffMembers: StaffMember[];
  styleCategories: string[];
  hairStyles: HairStyle[];
  homeInfo: InfoEntry[];
  infoEntries: InfoEntry[];
  priceSections: PriceSection[];
  priceHighlights: PriceHighlight[];
  shopCareItems: ShopCareItem[];
  photoGallery?: PhotoGalleryItem[];
  accessPage?: ManagedPageContent;
  recruitPage?: ManagedPageContent;
  shopPage?: ManagedPageContent;
  instagramFeed?: InstagramFeedItem[];
}
