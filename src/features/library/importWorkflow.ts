import { createAssetFromFile, createStableId, describeFilePath, fileIdentityKey } from './imageProcessing';
import type { ImageAsset } from './types';
import {
  createImportIssue,
  createImportReport,
  finishImportReport,
  appendIssue
} from '../workspace/reporting';
import type { ImportReport, ImportSource } from '../workspace/types';

const UNSUPPORTED_EXTENSIONS = new Set([
  'heic',
  'heif',
  'psd',
  'tif',
  'tiff',
  'cr2',
  'nef',
  'arw',
  'dng',
  'procreate',
  'kra'
]);

export interface ImportBatchResult {
  assets: ImageAsset[];
  report: ImportReport;
}

interface ImportBatchOptions {
  files: File[];
  source: ImportSource;
  existingIds: Set<string>;
  onProgress?: (processed: number, total: number, current?: string) => void;
}

export async function importAssetBatch(options: ImportBatchOptions): Promise<ImportBatchResult> {
  let report = createImportReport(options.source, options.files.length);
  const seenKeys = new Set<string>();
  const seenIds = new Set(options.existingIds);
  const assets: ImageAsset[] = [];

  for (const [index, file] of options.files.entries()) {
    options.onProgress?.(index, options.files.length, file.name);

    const path = describeFilePath(file);
    const dedupeKey = fileIdentityKey(file);
    const extension = extensionFromName(file.name);

    if (seenKeys.has(dedupeKey)) {
      report = appendIssue(
        report,
        createImportIssue({
          code: 'duplicate',
          severity: 'info',
          source: options.source,
          name: file.name,
          path,
          message: 'Skipped a duplicate file in this batch.',
          nextStep: 'Remove repeated files from the drop or keep one copy.'
        })
      );
      report.duplicates += 1;
      continue;
    }
    seenKeys.add(dedupeKey);

    if (extension && UNSUPPORTED_EXTENSIONS.has(extension)) {
      report = appendIssue(
        report,
        createImportIssue({
          code: 'unsupported-format',
          severity: 'warning',
          source: options.source,
          name: file.name,
          path,
          message: `This browser cannot reliably decode .${extension} reference files here.`,
          nextStep: 'Convert it to PNG, JPEG, WebP, AVIF, GIF, or SVG, then import again.'
        })
      );
      report.skipped += 1;
      continue;
    }

    const id = await createStableId(path, file.size, file.lastModified);
    if (seenIds.has(id)) {
      report = appendIssue(
        report,
        createImportIssue({
          code: 'duplicate',
          severity: 'info',
          source: options.source,
          name: file.name,
          path,
          message: 'Skipped a file that is already in this workspace.',
          nextStep: 'Rename or edit the file if you want to keep another revision.'
        })
      );
      report.duplicates += 1;
      continue;
    }

    try {
      const asset = await createAssetFromFile(file);
      seenIds.add(asset.id);
      assets.push(asset);
      report.imported += 1;
    } catch {
      report = appendIssue(
        report,
        createImportIssue({
          code: 'decode-failed',
          severity: 'error',
          source: options.source,
          name: file.name,
          path,
          message: 'The image could not be decoded in this browser.',
          nextStep: 'Try exporting the file again or convert it to PNG, JPEG, or WebP.'
        })
      );
      report.failed += 1;
    }
  }

  options.onProgress?.(options.files.length, options.files.length);

  return {
    assets,
    report: finishImportReport(report)
  };
}

function extensionFromName(name: string) {
  const match = /\.([a-z0-9]+)$/i.exec(name);
  return match ? match[1].toLowerCase() : '';
}
