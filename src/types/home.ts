export type HomeSourceProvider = 'wordpress' | 'local';

export interface HomeMediaItem {
  id: string;
  url: string;
  alt?: string;
  sortOrder: number;
}

export interface HomeMainVisualData {
  items: HomeMediaItem[];
  transitionSeconds: number;
  effect: 'fade';
  loop: boolean;
  randomize: boolean;
}

export interface HomeMonitorData {
  items: HomeMediaItem[];
  displayCount: number;
  gridColumns: number;
  gapPx: number;
  transitionSeconds: number;
  randomize: boolean;
  linkUrl: string;
}

export interface HomeLinksData {
  hairInstagramUrl: string;
  photoInstagramUrl: string;
}

export interface HomeDataSourceMeta {
  provider: HomeSourceProvider;
  endpoint?: string;
  fallbackApplied: boolean;
}

export interface HomeDataResponse {
  mainVisual: HomeMainVisualData;
  hairMonitor: HomeMonitorData;
  photoMonitor: HomeMonitorData;
  links: HomeLinksData;
  source: HomeDataSourceMeta;
}
