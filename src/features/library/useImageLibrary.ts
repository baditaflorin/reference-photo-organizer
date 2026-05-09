import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { boardSummaryText } from '../export/metadata';
import { downloadBlob } from '../export/download';
import { classifyImageWithClip } from './clipClient';
import { createDemoAssets } from './demoImages';
import { importAssetBatch } from './importWorkflow';
import {
  clearPersistedImages,
  clearPersistedWorkspace,
  loadPersistedImages,
  loadWorkspaceMeta,
  persistImage,
  persistImages,
  persistWorkspaceMeta
} from './storage';
import { mergeTags } from './tags';
import type { ImageAsset, ImportProgress } from './types';
import { createDefaultWorkspaceMeta } from '../workspace/defaults';
import { createImportIssue, importReportSummary } from '../workspace/reporting';
import { createWorkspaceFile, createWorkspaceFileName, parseWorkspaceText } from '../workspace/serialization';
import type {
  ImportIssue,
  ImportReport,
  ImportSource,
  WorkspaceImportResult,
  WorkspaceMeta,
  WorkspaceSettings,
  WorkspaceViewState
} from '../workspace/types';

const clipDisabledByQuery = new URLSearchParams(window.location.search).get('clip') === '0';

type TextImportSource = Extract<ImportSource, 'paste' | 'clipboard' | 'state-text' | 'state-file'>;

interface LibraryStatus {
  tagged: number;
  failed: number;
  total: number;
}

export interface UseImageLibraryResult {
  images: ImageAsset[];
  workspaceMeta: WorkspaceMeta;
  isImporting: boolean;
  isTagging: boolean;
  isReadingClipboard: boolean;
  progress: ImportProgress | null;
  notice: string | null;
  setNotice: Dispatch<SetStateAction<string | null>>;
  status: LibraryStatus;
  importFiles: (files: File[], source?: ImportSource) => Promise<void>;
  importFromUrl: (urlText: string) => Promise<void>;
  importWorkspaceFile: (file: File) => Promise<void>;
  importText: (text: string) => Promise<void>;
  importFromText: (text: string, source?: TextImportSource) => Promise<void>;
  readClipboard: () => Promise<void>;
  handlePasteEvent: (event: ClipboardEvent) => Promise<void>;
  loadDemo: () => Promise<void>;
  retagWithClip: () => Promise<void>;
  clearImages: () => Promise<void>;
  factoryReset: () => Promise<void>;
  removeImage: (id: string) => Promise<void>;
  updateView: (patch: Partial<WorkspaceViewState>) => void;
  updateSettings: (patch: Partial<WorkspaceSettings>) => void;
  exportWorkspaceState: () => Promise<void>;
  copyWorkspaceSummary: () => Promise<void>;
}

interface ClipboardReaderWithImages extends Clipboard {
  read: () => Promise<ClipboardItem[]>;
}

function hasClipboardImageRead(clipboard: Clipboard): clipboard is ClipboardReaderWithImages {
  return typeof (clipboard as Partial<ClipboardReaderWithImages>).read === 'function';
}

export function useImageLibrary(): UseImageLibraryResult {
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [workspaceMeta, setWorkspaceMeta] = useState<WorkspaceMeta>(() => {
    const meta = createDefaultWorkspaceMeta();
    return {
      ...meta,
      settings: {
        ...meta.settings,
        clipEnabled: !clipDisabledByQuery
      }
    };
  });
  const [isImporting, setIsImporting] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const [isReadingClipboard, setIsReadingClipboard] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const imageRef = useRef<ImageAsset[]>([]);
  const metaRef = useRef<WorkspaceMeta>(workspaceMeta);

  useEffect(() => {
    imageRef.current = images;
  }, [images]);

  useEffect(() => {
    metaRef.current = workspaceMeta;
  }, [workspaceMeta]);

  useEffect(() => {
    let active = true;

    void Promise.all([loadPersistedImages(), loadWorkspaceMeta()])
      .then(([records, meta]) => {
        if (!active) {
          return;
        }

        const restoredMeta = meta.settings.autoRestore
          ? meta
          : {
              ...createDefaultWorkspaceMeta(),
              settings: meta.settings
            };
        setWorkspaceMeta(restoredMeta);

        if (meta.settings.autoRestore && records.length > 0) {
          setImages(records);
          setNotice(`Restored ${records.length} local image${records.length === 1 ? '' : 's'}.`);
        }
      })
      .catch(() => {
        if (active) {
          setNotice('Local restore was skipped.');
        }
      });

    return () => {
      active = false;
      imageRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    };
  }, []);

  useEffect(() => {
    void persistWorkspaceMeta(workspaceMeta);
  }, [workspaceMeta]);

  async function importFiles(files: File[], source: ImportSource = 'picker') {
    if (files.length === 0) {
      setNotice('No image files found.');
      return;
    }

    setIsImporting(true);
    try {
      const result = await importAssetBatch({
        files,
        source,
        existingIds: new Set(imageRef.current.map((image) => image.id)),
        onProgress: (processed, total, current) => {
          setProgress({ processed, total, current });
        }
      });

      if (result.assets.length > 0) {
        imageRef.current = upsertImages(imageRef.current, result.assets);
        setImages((current) => upsertImages(current, result.assets));
        await persistImages(result.assets);
      }

      updateWorkspaceMeta({
        lastImportReport: result.report
      });
      setNotice(importReportSummary(result.report));

      if (metaRef.current.settings.clipEnabled && result.assets.length > 0) {
        await tagAssets(result.assets);
      }
    } finally {
      setIsImporting(false);
      setProgress(null);
    }
  }

  async function loadDemo() {
    setIsImporting(true);
    try {
      const demos = await createDemoAssets();
      imageRef.current = upsertImages(imageRef.current, demos);
      setImages((current) => upsertImages(current, demos));
      await persistImages(demos);

      const report: ImportReport = {
        source: 'demo' as const,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        attempted: demos.length,
        imported: demos.length,
        duplicates: 0,
        skipped: 0,
        failed: 0,
        issues: []
      };

      updateWorkspaceMeta({
        lastImportReport: report
      });
      setNotice('Demo board loaded.');
    } finally {
      setIsImporting(false);
    }
  }

  async function importFromUrl(urlText: string) {
    const value = urlText.trim();
    if (value.length === 0) {
      setNotice('Paste or type an image URL first.');
      return;
    }

    let url: URL;
    try {
      url = new URL(value);
    } catch {
      const report = failedSingleIssueReport(
        'url',
        createImportIssue({
          code: 'url-invalid',
          severity: 'error',
          source: 'url',
          name: value,
          message: 'That is not a valid URL.',
          nextStep: 'Paste a direct image URL that starts with http:// or https://.'
        })
      );
      updateWorkspaceMeta({ lastImportReport: report });
      setNotice(report.issues[0].message);
      return;
    }

    setIsImporting(true);
    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(String(response.status));
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.startsWith('image/')) {
        const report = failedSingleIssueReport(
          'url',
          createImportIssue({
            code: 'url-unsupported',
            severity: 'warning',
            source: 'url',
            name: url.toString(),
            message: 'That URL did not return an image file.',
            nextStep: 'Open the direct image itself, then paste or save it before importing.'
          })
        );
        updateWorkspaceMeta({ lastImportReport: report });
        setNotice(report.issues[0].message);
        return;
      }

      const blob = await response.blob();
      const name = decodeURIComponent(url.pathname.split('/').pop() || `reference-${Date.now()}.png`);
      const file = new File([blob], name, { type: contentType, lastModified: Date.now() });
      await importFiles([file], 'url');
    } catch {
      const report = failedSingleIssueReport(
        'url',
        createImportIssue({
          code: 'url-fetch-failed',
          severity: 'error',
          source: 'url',
          name: value,
          message: 'The browser could not download that image here.',
          nextStep:
            'If the site blocks browser downloads, save the image locally and use upload or paste instead.'
        })
      );
      updateWorkspaceMeta({ lastImportReport: report });
      setNotice(report.issues[0].message);
    } finally {
      setIsImporting(false);
      setProgress(null);
    }
  }

  async function importWorkspaceFile(file: File) {
    const text = await file.text();
    await importFromText(text, 'state-file');
  }

  async function importText(text: string): Promise<void> {
    await importFromText(text, 'paste');
  }

  async function importFromText(text: string, source: TextImportSource = 'paste'): Promise<void> {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      setNotice('The pasted content was empty.');
      return;
    }

    if (trimmed.startsWith('{')) {
      try {
        const workspace = parseWorkspaceText(trimmed);
        await replaceWorkspace(
          workspace.images.map((image) => hydrateImportedImage(image)),
          {
            ...workspace.meta,
            lastImportReport:
              workspace.meta.lastImportReport ??
              failedSingleIssueReport(
                source,
                createImportIssue({
                  code: 'state-invalid',
                  severity: 'info',
                  source,
                  name: 'workspace',
                  message: 'Workspace imported.',
                  nextStep: 'Your board is ready to review.'
                })
              )
          }
        );
        setNotice(
          `Workspace imported (${workspace.images.length} image${workspace.images.length === 1 ? '' : 's'}).`
        );
      } catch {
        const report = failedSingleIssueReport(
          source,
          createImportIssue({
            code: 'state-invalid',
            severity: 'error',
            source,
            name: 'workspace',
            message: 'That text was not a valid Reference Photo Organizer workspace file.',
            nextStep: 'Paste a workspace JSON export or use the image URL field instead.'
          })
        );
        updateWorkspaceMeta({ lastImportReport: report });
        setNotice(report.issues[0].message);
      }
      return;
    }

    await importFromUrl(trimmed);
  }

  async function readClipboard() {
    if (!navigator.clipboard) {
      const report = failedSingleIssueReport(
        'clipboard',
        createImportIssue({
          code: 'clipboard-permission',
          severity: 'warning',
          source: 'clipboard',
          name: 'clipboard',
          message: 'This browser does not expose clipboard import here.',
          nextStep: 'Use paste, drag and drop, or the file picker instead.'
        })
      );
      updateWorkspaceMeta({ lastImportReport: report });
      setNotice(report.issues[0].message);
      return;
    }

    setIsReadingClipboard(true);
    try {
      if (hasClipboardImageRead(navigator.clipboard)) {
        const items = await navigator.clipboard.read();
        const files: File[] = [];

        for (const item of items) {
          const imageType = item.types.find((type) => type.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            files.push(
              new File([blob], `clipboard-${Date.now()}.${extensionForType(imageType)}`, { type: imageType })
            );
          }
        }

        if (files.length > 0) {
          await importFiles(files, 'clipboard');
          return;
        }
      }

      const text = await navigator.clipboard.readText();
      if (text.trim().length > 0) {
        await importFromText(text, 'clipboard');
        return;
      }

      const report = failedSingleIssueReport(
        'clipboard',
        createImportIssue({
          code: 'clipboard-empty',
          severity: 'warning',
          source: 'clipboard',
          name: 'clipboard',
          message: 'The clipboard did not contain an image or workspace text.',
          nextStep: 'Copy an image, an image URL, or a workspace JSON export, then try again.'
        })
      );
      updateWorkspaceMeta({ lastImportReport: report });
      setNotice(report.issues[0].message);
    } catch {
      const report = failedSingleIssueReport(
        'clipboard',
        createImportIssue({
          code: 'clipboard-permission',
          severity: 'error',
          source: 'clipboard',
          name: 'clipboard',
          message: 'Clipboard access was blocked by the browser.',
          nextStep: 'Allow clipboard access, or use paste, drag and drop, or the file picker instead.'
        })
      );
      updateWorkspaceMeta({ lastImportReport: report });
      setNotice(report.issues[0].message);
    } finally {
      setIsReadingClipboard(false);
    }
  }

  async function handlePasteEvent(event: ClipboardEvent): Promise<void> {
    const files = [...(event.clipboardData?.files ?? [])].filter((file) => file.type.startsWith('image/'));
    if (files.length > 0) {
      event.preventDefault();
      await importFiles(files, 'paste');
      return;
    }

    const text = event.clipboardData?.getData('text/plain') ?? '';
    if (text.trim().length > 0) {
      event.preventDefault();
      await importFromText(text, 'paste');
    }
  }

  async function exportWorkspaceState(): Promise<void> {
    const workspaceFile = await createWorkspaceFile(imageRef.current, metaRef.current);
    const payload = JSON.stringify(workspaceFile, null, 2);
    downloadBlob(new Blob([payload], { type: 'application/json' }), createWorkspaceFileName(metaRef.current));
    setNotice('Workspace file exported.');
  }

  async function copyWorkspaceSummary(): Promise<void> {
    const summary = boardSummaryText(
      metaRef.current,
      metaRef.current.lastImportReport,
      imageRef.current.length
    );
    try {
      await navigator.clipboard.writeText(summary);
      setNotice('Board summary copied.');
    } catch {
      const report = failedSingleIssueReport(
        'clipboard',
        createImportIssue({
          code: 'clipboard-permission',
          severity: 'warning',
          source: 'clipboard',
          name: 'clipboard',
          message: 'The browser blocked copying the board summary.',
          nextStep: 'Allow clipboard access for this site, then try Copy summary again.'
        })
      );
      updateWorkspaceMeta({ lastImportReport: report });
      setNotice(report.issues[0].message);
    }
  }

  async function retagWithClip(): Promise<void> {
    const candidates = imageRef.current;
    if (candidates.length === 0) {
      setNotice('Import images before CLIP tagging.');
      return;
    }

    await tagAssets(candidates);
  }

  async function clearImages(): Promise<void> {
    imageRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    imageRef.current = [];
    setImages([]);
    await clearPersistedImages();
    updateWorkspaceMeta({
      view: {
        ...metaRef.current.view,
        searchQuery: '',
        activeTag: '',
        activeImageId: null
      },
      lastImportReport: null
    });
    setNotice('Workspace images cleared.');
  }

  async function factoryReset(): Promise<void> {
    imageRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    imageRef.current = [];
    setImages([]);
    const resetMeta = createDefaultWorkspaceMeta();
    setWorkspaceMeta(resetMeta);
    await Promise.all([clearPersistedImages(), clearPersistedWorkspace()]);
    setNotice('Workspace reset. Local images and settings were cleared.');
  }

  async function removeImage(id: string): Promise<void> {
    const remaining = imageRef.current.filter((image) => image.id !== id);
    const removed = imageRef.current.find((image) => image.id === id);
    if (removed) {
      URL.revokeObjectURL(removed.url);
    }

    await clearPersistedImages();
    await persistImages(remaining);
    imageRef.current = remaining;
    setImages(remaining);

    updateWorkspaceMeta({
      view: {
        ...metaRef.current.view,
        activeImageId:
          metaRef.current.view.activeImageId === id
            ? (remaining[0]?.id ?? null)
            : metaRef.current.view.activeImageId
      }
    });
  }

  function updateView(patch: Partial<WorkspaceViewState>): void {
    updateWorkspaceMeta({
      view: {
        ...metaRef.current.view,
        ...patch
      }
    });
  }

  function updateSettings(patch: Partial<WorkspaceSettings>): void {
    updateWorkspaceMeta({
      settings: {
        ...metaRef.current.settings,
        ...patch
      }
    });
  }

  const status: LibraryStatus = {
    tagged: images.filter((image) => image.clipStatus === 'tagged').length,
    failed: images.filter((image) => image.clipStatus === 'failed').length,
    total: images.length
  };

  return {
    images,
    workspaceMeta,
    isImporting,
    isTagging,
    isReadingClipboard,
    progress,
    notice,
    setNotice,
    status,
    importFiles,
    importFromUrl,
    importWorkspaceFile,
    importText,
    importFromText,
    readClipboard,
    handlePasteEvent,
    loadDemo,
    retagWithClip,
    clearImages,
    factoryReset,
    removeImage,
    updateView,
    updateSettings,
    exportWorkspaceState,
    copyWorkspaceSummary
  };

  async function tagAssets(assets: ImageAsset[]): Promise<void> {
    setIsTagging(true);
    try {
      for (const asset of assets) {
        imageRef.current = patchImage(imageRef.current, asset.id, { clipStatus: 'running' });
        setImages((current) => patchImage(current, asset.id, { clipStatus: 'running' }));
        try {
          const clipTags = await classifyImageWithClip(asset.blob);
          const latest = imageRef.current.find((image) => image.id === asset.id) ?? asset;
          const updated = {
            ...latest,
            tags: mergeTags(latest.tags, clipTags),
            clipStatus: 'tagged' as const
          };
          await persistImage(updated);
          setImages((current) => patchImage(current, asset.id, updated));
          imageRef.current = patchImage(imageRef.current, asset.id, updated);
        } catch {
          const latest = imageRef.current.find((image) => image.id === asset.id) ?? asset;
          const updated = { ...latest, clipStatus: 'failed' as const };
          await persistImage(updated);
          setImages((current) => patchImage(current, asset.id, updated));
          imageRef.current = patchImage(imageRef.current, asset.id, updated);
          setNotice('CLIP model unavailable; local tags are still active.');
          break;
        }
      }
    } finally {
      setIsTagging(false);
    }
  }

  async function replaceWorkspace(nextImages: ImageAsset[], nextMeta: WorkspaceMeta): Promise<void> {
    imageRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    imageRef.current = nextImages;
    setImages(nextImages);
    setWorkspaceMeta(nextMeta);
    await clearPersistedImages();
    await persistImages(nextImages);
    await persistWorkspaceMeta(nextMeta);
  }

  function updateWorkspaceMeta(patch: Partial<WorkspaceMeta>): void {
    const nextMeta: WorkspaceMeta = {
      ...metaRef.current,
      ...patch,
      settings: patch.settings ?? metaRef.current.settings,
      view: patch.view ?? metaRef.current.view,
      updatedAt: new Date().toISOString()
    };
    metaRef.current = nextMeta;
    setWorkspaceMeta(nextMeta);
  }
}

function hydrateImportedImage(image: WorkspaceImportResult['images'][number]): ImageAsset {
  return {
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
    blob: image.blob,
    url: URL.createObjectURL(image.blob)
  };
}

function patchImage(current: ImageAsset[], id: string, patch: Partial<ImageAsset>): ImageAsset[] {
  return current.map((image) => (image.id === id ? { ...image, ...patch } : image));
}

function upsertImages(current: ImageAsset[], incoming: ImageAsset[]): ImageAsset[] {
  const byId = new Map(current.map((image) => [image.id, image]));
  for (const image of incoming) {
    const previous = byId.get(image.id);
    if (previous && previous.url !== image.url) {
      URL.revokeObjectURL(previous.url);
    }
    byId.set(image.id, image);
  }

  return [...byId.values()];
}

function failedSingleIssueReport(source: ImportSource, issue: ImportIssue): ImportReport {
  return {
    source,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    attempted: 1,
    imported: 0,
    duplicates: 0,
    skipped: issue.severity === 'warning' ? 1 : 0,
    failed: issue.severity === 'error' ? 1 : 0,
    issues: [issue]
  };
}

function extensionForType(type: string): string {
  if (type === 'image/jpeg') {
    return 'jpg';
  }
  if (type === 'image/svg+xml') {
    return 'svg';
  }
  return type.split('/')[1] || 'png';
}
