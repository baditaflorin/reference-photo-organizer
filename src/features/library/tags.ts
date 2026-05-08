import { averagePaletteColor, colorSaturation, colorTemperature, relativeLuminance } from './color';
import type { ColorSwatch, ImageTag } from './types';

export const CLIP_CANDIDATE_LABELS = [
  'portrait',
  'figure drawing',
  'pose reference',
  'anatomy',
  'hands',
  'face',
  'animal',
  'plant',
  'forest',
  'mountain',
  'desert',
  'ocean',
  'water',
  'sky',
  'clouds',
  'city',
  'architecture',
  'interior',
  'vehicle',
  'weapon',
  'costume',
  'fabric',
  'metal',
  'wood',
  'stone',
  'food',
  'still life',
  'abstract',
  'dramatic lighting',
  'soft lighting',
  'backlit',
  'high contrast',
  'low contrast',
  'warm palette',
  'cool palette',
  'moody',
  'peaceful',
  'chaotic',
  'cinematic',
  'vintage'
];

const FILENAME_TAGS: Record<string, string[]> = {
  portrait: ['portrait', 'face', 'headshot', 'profile'],
  anatomy: ['anatomy', 'muscle', 'skeleton'],
  pose: ['pose', 'gesture', 'action'],
  landscape: ['landscape', 'mountain', 'forest', 'desert', 'ocean'],
  architecture: ['architecture', 'building', 'interior', 'room'],
  vehicle: ['vehicle', 'car', 'ship', 'plane', 'bike'],
  costume: ['costume', 'cloth', 'fabric', 'outfit'],
  animal: ['animal', 'creature', 'bird', 'cat', 'dog', 'horse'],
  plant: ['plant', 'flower', 'tree', 'leaf']
};

export function deriveFallbackTags(
  fileName: string,
  palette: ColorSwatch[],
  width: number,
  height: number
): ImageTag[] {
  const tags: ImageTag[] = [];
  const normalizedName = fileName.toLowerCase();
  const average = averagePaletteColor(palette);
  const luminance = relativeLuminance(average);
  const saturation = colorSaturation(average);
  const temperature = colorTemperature(average);

  if (width > height * 1.15) {
    tags.push({ label: 'landscape', score: 0.72, source: 'shape' });
  } else if (height > width * 1.15) {
    tags.push({ label: 'portrait', score: 0.72, source: 'shape' });
  } else {
    tags.push({ label: 'square crop', score: 0.55, source: 'shape' });
  }

  if (temperature !== 'balanced') {
    tags.push({ label: `${temperature} palette`, score: 0.68, source: 'palette' });
  }
  if (luminance < 0.28) {
    tags.push({ label: 'dark mood', score: 0.62, source: 'palette' });
  } else if (luminance > 0.72) {
    tags.push({ label: 'bright mood', score: 0.62, source: 'palette' });
  }
  if (saturation > 0.45) {
    tags.push({ label: 'saturated color', score: 0.58, source: 'palette' });
  } else if (saturation < 0.16) {
    tags.push({ label: 'muted color', score: 0.58, source: 'palette' });
  }

  for (const [label, needles] of Object.entries(FILENAME_TAGS)) {
    if (needles.some((needle) => normalizedName.includes(needle))) {
      tags.push({ label, score: 0.7, source: 'filename' });
    }
  }

  return dedupeTags(tags).slice(0, 8);
}

export function dedupeTags(tags: ImageTag[]) {
  const byLabel = new Map<string, ImageTag>();

  for (const tag of tags) {
    const normalized = tag.label.toLowerCase().replaceAll('_', ' ').trim();
    const existing = byLabel.get(normalized);
    if (!existing || tag.score > existing.score || (existing.source !== 'clip' && tag.source === 'clip')) {
      byLabel.set(normalized, { ...tag, label: normalized });
    }
  }

  return [...byLabel.values()].sort((a, b) => b.score - a.score);
}

export function mergeTags(base: ImageTag[], incoming: ImageTag[], max = 10) {
  return dedupeTags([...incoming, ...base]).slice(0, max);
}

export function tagMatches(tag: ImageTag, query: string) {
  return tag.label.toLowerCase().includes(query.toLowerCase());
}
