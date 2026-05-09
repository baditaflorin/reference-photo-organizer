import { APP_VERSION, COMMIT_SHA } from '../../appMeta';
import type { ImportReport, WorkspaceMeta } from '../workspace/types';

export function exportSubtitle(count: number) {
  return `${count} references - palettes and tags`;
}

export function exportFooterLabel() {
  return `Generated locally by Reference Photo Organizer v${APP_VERSION} (${COMMIT_SHA})`;
}

export function boardSummaryText(meta: WorkspaceMeta, report: ImportReport | null, imageCount: number) {
  const lines = [
    meta.view.boardTitle,
    `Images: ${imageCount}`,
    `Layout: ${meta.view.layout}`,
    `CLIP auto-tags: ${meta.settings.clipEnabled ? 'on' : 'off'}`,
    `Export labels: ${meta.settings.exportIncludeLabels ? 'on' : 'off'}`,
    `App: v${APP_VERSION} (${COMMIT_SHA})`
  ];

  if (report) {
    lines.push(
      `Last import: ${report.imported} imported, ${report.duplicates} duplicates, ${report.skipped} skipped, ${report.failed} failed`
    );
  }

  return lines.join('\n');
}
