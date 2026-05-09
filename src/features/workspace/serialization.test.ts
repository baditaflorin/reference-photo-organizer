import { describe, expect, it } from 'vitest';
import { createDefaultWorkspaceMeta } from './defaults';
import { createWorkspaceFile, parseWorkspaceText } from './serialization';
import type { ImageAsset } from '../library/types';

function makeAsset(name: string): ImageAsset {
  return {
    id: `${name}-id`,
    name,
    path: `refs/${name}`,
    type: 'image/png',
    size: 14,
    lastModified: 100,
    importedAt: '2026-05-09T00:00:00.000Z',
    width: 2,
    height: 2,
    palette: [{ hex: '#cf9b45', rgb: [207, 155, 69], area: 1, role: 'dominant' }],
    tags: [
      { label: 'warm', score: 0.9, source: 'palette' },
      { label: 'figure', score: 0.8, source: 'clip' }
    ],
    clipStatus: 'tagged',
    blob: new Blob(['tiny-image'], { type: 'image/png' }),
    url: `blob:${name}`
  };
}

describe('workspace serialization', () => {
  it('round-trips images and workspace metadata through the exported state file', async () => {
    const meta = createDefaultWorkspaceMeta();
    meta.view.boardTitle = 'Figure board';
    meta.view.layout = 'contact';
    meta.settings.clipEnabled = false;
    meta.lastImportReport = {
      source: 'folder',
      startedAt: '2026-05-09T00:00:00.000Z',
      completedAt: '2026-05-09T00:00:05.000Z',
      attempted: 2,
      imported: 1,
      duplicates: 1,
      skipped: 0,
      failed: 0,
      issues: []
    };

    const original = await createWorkspaceFile([makeAsset('pose.png')], meta);
    const restored = parseWorkspaceText(JSON.stringify(original));

    expect(restored.meta.view.boardTitle).toBe('Figure board');
    expect(restored.meta.view.layout).toBe('contact');
    expect(restored.meta.settings.clipEnabled).toBe(false);
    expect(restored.meta.lastImportReport?.duplicates).toBe(1);
    expect(restored.images).toHaveLength(1);
    expect(restored.images[0]?.name).toBe('pose.png');
    expect(restored.images[0]?.tags.map((tag) => tag.label)).toEqual(['warm', 'figure']);
    expect(restored.images[0]?.blob.type).toBe('image/png');
    expect(await restored.images[0]?.blob.text()).toBe('tiny-image');
  });
});
