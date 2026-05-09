import { z } from 'zod';
import { APP_VERSION, COMMIT_SHA } from '../../appMeta';
import { blobToDataUrl, dataUrlToBlob } from '../library/imageProcessing';
import type { ImageAsset } from '../library/types';
import { createDefaultWorkspaceMeta } from './defaults';
import type { ExportedImageAsset, WorkspaceFile, WorkspaceImportResult, WorkspaceMeta } from './types';
import { WORKSPACE_SCHEMA_VERSION } from './types';

const colorSwatchSchema = z.object({
  hex: z.string(),
  rgb: z.tuple([z.number(), z.number(), z.number()]),
  area: z.number(),
  role: z.string()
});

const imageTagSchema = z.object({
  label: z.string(),
  score: z.number(),
  source: z.enum(['clip', 'palette', 'filename', 'shape', 'demo'])
});

const importIssueSchema = z.object({
  id: z.string(),
  code: z.enum([
    'duplicate',
    'unsupported-format',
    'decode-failed',
    'clipboard-empty',
    'clipboard-permission',
    'url-invalid',
    'url-fetch-failed',
    'url-unsupported',
    'state-invalid',
    'state-migration-failed',
    'folder-unsupported'
  ]),
  severity: z.enum(['info', 'warning', 'error']),
  source: z.enum([
    'picker',
    'folder',
    'drop',
    'clipboard',
    'paste',
    'url',
    'state-file',
    'state-text',
    'demo',
    'restore'
  ]),
  name: z.string(),
  path: z.string(),
  message: z.string(),
  nextStep: z.string()
});

const importReportSchema = z.object({
  source: z.enum([
    'picker',
    'folder',
    'drop',
    'clipboard',
    'paste',
    'url',
    'state-file',
    'state-text',
    'demo',
    'restore'
  ]),
  startedAt: z.string(),
  completedAt: z.string(),
  attempted: z.number(),
  imported: z.number(),
  duplicates: z.number(),
  skipped: z.number(),
  failed: z.number(),
  issues: z.array(importIssueSchema)
});

const workspaceMetaSchema = z.object({
  schemaVersion: z.number(),
  settings: z.object({
    clipEnabled: z.boolean(),
    exportIncludeLabels: z.boolean(),
    autoRestore: z.boolean()
  }),
  view: z.object({
    boardTitle: z.string(),
    layout: z.enum(['masonry', 'spectrum', 'contact']),
    searchQuery: z.string(),
    activeTag: z.string(),
    activeImageId: z.string().nullable()
  }),
  lastImportReport: importReportSchema.nullable(),
  updatedAt: z.string()
});

const exportedImageSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  type: z.string(),
  size: z.number(),
  lastModified: z.number(),
  importedAt: z.string(),
  width: z.number(),
  height: z.number(),
  palette: z.array(colorSwatchSchema),
  tags: z.array(imageTagSchema),
  clipStatus: z.enum(['idle', 'queued', 'running', 'tagged', 'failed', 'fallback']),
  dataUrl: z.string()
});

const workspaceFileSchema = z.object({
  schemaVersion: z.number(),
  exportedAt: z.string(),
  appVersion: z.string(),
  commitSha: z.string(),
  meta: workspaceMetaSchema,
  images: z.array(exportedImageSchema)
});

export async function createWorkspaceFile(images: ImageAsset[], meta: WorkspaceMeta): Promise<WorkspaceFile> {
  const exportedImages: ExportedImageAsset[] = await Promise.all(
    images.map(async (image) => ({
      id: image.id,
      name: image.name,
      path: image.path,
      type: image.type,
      size: image.size,
      lastModified: image.lastModified,
      importedAt: image.importedAt,
      width: image.width,
      height: image.height,
      palette: image.palette,
      tags: image.tags,
      clipStatus: image.clipStatus,
      dataUrl: await blobToDataUrl(image.blob)
    }))
  );

  return {
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
    commitSha: COMMIT_SHA,
    meta: {
      ...meta,
      schemaVersion: WORKSPACE_SCHEMA_VERSION,
      updatedAt: new Date().toISOString()
    },
    images: exportedImages
  };
}

export function parseWorkspaceText(text: string): WorkspaceImportResult {
  const parsedJson = JSON.parse(text) as unknown;
  const parsed = workspaceFileSchema.parse(parsedJson);
  return migrateWorkspaceFile(parsed);
}

export function createWorkspaceFileName(meta: WorkspaceMeta) {
  const title = meta.view.boardTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return `${title || 'reference-photo-organizer'}-workspace.json`;
}

function migrateWorkspaceFile(file: z.infer<typeof workspaceFileSchema>): WorkspaceImportResult {
  if (file.schemaVersion !== WORKSPACE_SCHEMA_VERSION) {
    const defaults = createDefaultWorkspaceMeta();
    return {
      meta: {
        ...defaults,
        ...file.meta,
        schemaVersion: WORKSPACE_SCHEMA_VERSION
      },
      images: file.images.map((image) => ({ ...image, blob: dataUrlToBlob(image.dataUrl, image.type) }))
    };
  }

  return {
    meta: file.meta,
    images: file.images.map((image) => ({ ...image, blob: dataUrlToBlob(image.dataUrl, image.type) }))
  };
}
