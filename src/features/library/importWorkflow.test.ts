import { beforeEach, describe, expect, it, vi } from 'vitest';
import { importAssetBatch } from './importWorkflow';
import type { ImageAsset } from './types';

const imageProcessingMocks = vi.hoisted(() => ({
  createAssetFromFile: vi.fn<(file: File) => Promise<ImageAsset>>(),
  createStableId: vi.fn<(path: string, size: number, lastModified: number) => Promise<string>>(),
  describeFilePath: vi.fn<(file: File) => string>(),
  fileIdentityKey: vi.fn<(file: File) => string>()
}));

vi.mock('./imageProcessing', () => ({
  createAssetFromFile: imageProcessingMocks.createAssetFromFile,
  createStableId: imageProcessingMocks.createStableId,
  describeFilePath: imageProcessingMocks.describeFilePath,
  fileIdentityKey: imageProcessingMocks.fileIdentityKey
}));

function makeFile(name: string, type = 'image/png'): File {
  return new File([name], name, { type, lastModified: 123 });
}

function makeAsset(file: File): ImageAsset {
  return {
    id: `${file.name}-asset`,
    name: file.name,
    path: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified,
    importedAt: '2026-05-09T00:00:00.000Z',
    width: 320,
    height: 240,
    palette: [{ hex: '#111111', rgb: [17, 17, 17], area: 1, role: 'dominant' }],
    tags: [{ label: 'test', score: 1, source: 'filename' }],
    clipStatus: 'fallback',
    blob: file,
    url: `blob:${file.name}`
  };
}

describe('importAssetBatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    imageProcessingMocks.describeFilePath.mockImplementation((file) => file.name);
    imageProcessingMocks.fileIdentityKey.mockImplementation(
      (file) => `${file.name}:${file.size}:${file.lastModified}`
    );
    imageProcessingMocks.createStableId.mockImplementation((path) => Promise.resolve(`${path}-id`));
    imageProcessingMocks.createAssetFromFile.mockImplementation((file) => Promise.resolve(makeAsset(file)));
  });

  it('continues importing after unsupported, duplicate, and failed files', async () => {
    const good = makeFile('good.png');
    const duplicateInBatch = makeFile('good.png');
    const unsupported = makeFile('camera.heic', '');
    const broken = makeFile('broken.png');

    imageProcessingMocks.createStableId.mockImplementation((path) =>
      Promise.resolve(path === 'broken.png' ? 'broken-id' : `${path}-id`)
    );
    imageProcessingMocks.createAssetFromFile.mockImplementation((file) => {
      if (file.name === 'broken.png') {
        return Promise.reject(new Error('decode failed'));
      }
      return Promise.resolve(makeAsset(file));
    });

    const result = await importAssetBatch({
      files: [good, duplicateInBatch, unsupported, broken],
      source: 'folder',
      existingIds: new Set<string>(),
      onProgress: vi.fn()
    });

    expect(result.assets).toHaveLength(1);
    expect(result.assets[0]?.name).toBe('good.png');
    expect(result.report.imported).toBe(1);
    expect(result.report.duplicates).toBe(1);
    expect(result.report.skipped).toBe(1);
    expect(result.report.failed).toBe(1);
    expect(result.report.issues.map((issue) => issue.code)).toEqual([
      'duplicate',
      'unsupported-format',
      'decode-failed'
    ]);
  });

  it('skips files already present in the workspace', async () => {
    const file = makeFile('existing.png');

    const result = await importAssetBatch({
      files: [file],
      source: 'picker',
      existingIds: new Set<string>(['existing.png-id']),
      onProgress: vi.fn()
    });

    expect(result.assets).toHaveLength(0);
    expect(result.report.duplicates).toBe(1);
    expect(result.report.issues[0]?.message).toContain('already in this workspace');
  });
});
