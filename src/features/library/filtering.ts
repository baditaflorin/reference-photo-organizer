import { averagePaletteColor } from './color';
import type { BoardFilters, ImageAsset } from './types';

export function filterImages(images: ImageAsset[], filters: BoardFilters) {
  const search = filters.search.trim().toLowerCase();

  return images.filter((image) => {
    const haystack =
      `${image.name} ${image.path} ${image.tags.map((tag) => tag.label).join(' ')}`.toLowerCase();
    const matchesSearch = search.length === 0 || haystack.includes(search);
    const matchesTag = !filters.tag || image.tags.some((tag) => tag.label === filters.tag);
    return matchesSearch && matchesTag;
  });
}

export function sortImagesForLayout(images: ImageAsset[], layout: BoardFilters['layout']) {
  if (layout === 'spectrum') {
    return [...images].sort((a, b) => {
      const colorA = averagePaletteColor(a.palette);
      const colorB = averagePaletteColor(b.palette);
      return colorA[0] + colorA[1] * 2 + colorA[2] * 3 - (colorB[0] + colorB[1] * 2 + colorB[2] * 3);
    });
  }

  if (layout === 'contact') {
    return [...images].sort((a, b) => a.name.localeCompare(b.name));
  }

  return images;
}

export function collectTags(images: ImageAsset[]) {
  const counts = new Map<string, number>();
  for (const image of images) {
    for (const tag of image.tags) {
      counts.set(tag.label, (counts.get(tag.label) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({ label, count }));
}
