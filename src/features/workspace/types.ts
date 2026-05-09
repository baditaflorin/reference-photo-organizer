import type { BoardLayout, ClipStatus, ColorSwatch, ImageTag } from '../library/types';

export const WORKSPACE_SCHEMA_VERSION = 1;

export type ImportSource =
  | 'picker'
  | 'folder'
  | 'drop'
  | 'clipboard'
  | 'paste'
  | 'url'
  | 'state-file'
  | 'state-text'
  | 'demo'
  | 'restore';

export type ImportIssueCode =
  | 'duplicate'
  | 'unsupported-format'
  | 'decode-failed'
  | 'clipboard-empty'
  | 'clipboard-permission'
  | 'url-invalid'
  | 'url-fetch-failed'
  | 'url-unsupported'
  | 'state-invalid'
  | 'state-migration-failed'
  | 'folder-unsupported';

export type ImportIssueSeverity = 'info' | 'warning' | 'error';

export interface ImportIssue {
  id: string;
  code: ImportIssueCode;
  severity: ImportIssueSeverity;
  source: ImportSource;
  name: string;
  path: string;
  message: string;
  nextStep: string;
}

export interface ImportReport {
  source: ImportSource;
  startedAt: string;
  completedAt: string;
  attempted: number;
  imported: number;
  duplicates: number;
  skipped: number;
  failed: number;
  issues: ImportIssue[];
}

export interface WorkspaceSettings {
  clipEnabled: boolean;
  exportIncludeLabels: boolean;
  autoRestore: boolean;
}

export interface WorkspaceViewState {
  boardTitle: string;
  layout: BoardLayout;
  searchQuery: string;
  activeTag: string;
  activeImageId: string | null;
}

export interface WorkspaceMeta {
  schemaVersion: number;
  settings: WorkspaceSettings;
  view: WorkspaceViewState;
  lastImportReport: ImportReport | null;
  updatedAt: string;
}

export interface ExportedImageAsset {
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
  dataUrl: string;
}

export interface WorkspaceFile {
  schemaVersion: number;
  exportedAt: string;
  appVersion: string;
  commitSha: string;
  meta: WorkspaceMeta;
  images: ExportedImageAsset[];
}

export interface WorkspaceImportResult {
  meta: WorkspaceMeta;
  images: Array<ExportedImageAsset & { blob: Blob }>;
}
