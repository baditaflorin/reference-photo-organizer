export type TagSource = 'clip' | 'palette' | 'filename' | 'shape' | 'demo';

export type ClipStatus = 'idle' | 'queued' | 'running' | 'tagged' | 'failed' | 'fallback';

export interface ColorSwatch {
  hex: string;
  rgb: [number, number, number];
  area: number;
  role: string;
}

export interface ImageTag {
  label: string;
  score: number;
  source: TagSource;
}

export interface ImageAsset {
  id: string;
  name: string;
  path: string;
  type: string;
  size: number;
  lastModified: number;
  importedAt: string;
  width: number;
  height: number;
  palette: ColorSwatch[];
  tags: ImageTag[];
  clipStatus: ClipStatus;
  blob: Blob;
  url: string;
}

export type PersistedImageAsset = Omit<ImageAsset, 'url'>;

export interface ImportProgress {
  total: number;
  processed: number;
  current?: string;
}

export interface BoardFilters {
  search: string;
  tag: string;
  layout: BoardLayout;
}

export type BoardLayout = 'masonry' | 'spectrum' | 'contact';

export interface ExportOptions {
  title: string;
  showLabels: boolean;
}

export interface ImportableAsset {
  asset: ImageAsset;
  dedupeKey: string;
}
