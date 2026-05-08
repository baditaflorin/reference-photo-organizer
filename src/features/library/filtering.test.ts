import { describe, expect, it } from 'vitest';
import { collectTags, filterImages, sortImagesForLayout } from './filtering';
import type { ImageAsset } from './types';

function asset(name: string, tags: string[], hex = '#cf9b45'): ImageAsset {
  return {
    id: name,
    name,
    path: `folder/${name}`,
    type: 'image/png',
    size: 100,
    lastModified: 1,
    importedAt: '2026-05-08T00:00:00.000Z',
    width: 400,
    height: 300,
    palette: [{ hex, rgb: [207, 155, 69], area: 1, role: 'dominant' }],
    tags: tags.map((label) => ({ label, score: 1, source: 'clip' })),
    clipStatus: 'tagged',
    blob: new Blob(),
    url: `blob:${name}`
  };
}

describe('library filtering', () => {
  it('filters by search and tag', () => {
    const images = [asset('city.png', ['architecture']), asset('pose.png', ['figure drawing'])];

    expect(filterImages(images, { search: 'city', tag: '', layout: 'masonry' })).toHaveLength(1);
    expect(filterImages(images, { search: '', tag: 'figure drawing', layout: 'masonry' })[0]?.name).toBe(
      'pose.png'
    );
  });

  it('collects tag counts in descending order', () => {
    const tags = collectTags([asset('a.png', ['portrait', 'warm']), asset('b.png', ['portrait'])]);
    expect(tags[0]).toEqual({ label: 'portrait', count: 2 });
  });

  it('sorts contact sheets by filename', () => {
    const sorted = sortImagesForLayout([asset('b.png', []), asset('a.png', [])], 'contact');
    expect(sorted.map((image) => image.name)).toEqual(['a.png', 'b.png']);
  });
});
