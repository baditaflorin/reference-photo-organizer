import type { WorkspaceMeta, WorkspaceSettings, WorkspaceViewState } from './types';
import { WORKSPACE_SCHEMA_VERSION } from './types';

export const DEFAULT_WORKSPACE_SETTINGS: WorkspaceSettings = {
  clipEnabled: true,
  exportIncludeLabels: true,
  autoRestore: true
};

export const DEFAULT_WORKSPACE_VIEW: WorkspaceViewState = {
  boardTitle: 'Artist reference board',
  layout: 'masonry',
  searchQuery: '',
  activeTag: '',
  activeImageId: null
};

export function createDefaultWorkspaceMeta(): WorkspaceMeta {
  return {
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    settings: { ...DEFAULT_WORKSPACE_SETTINGS },
    view: { ...DEFAULT_WORKSPACE_VIEW },
    lastImportReport: null,
    updatedAt: new Date().toISOString()
  };
}
