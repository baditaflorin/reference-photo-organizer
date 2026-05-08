import quantize from 'quantize';
import { rgbToHex } from './color';
import { deriveFallbackTags } from './tags';
import type { ColorSwatch, ImageAsset } from './types';

export async function createAssetFromFile(file: File): Promise<ImageAsset> {
  const path = (file as File & { webkitRelativePath: string }).webkitRelativePath || file.name;
  const id = await createStableId(path, file.size, file.lastModified);
  const url = URL.createObjectURL(file);
  const { width, height } = await readImageDimensions(url);
  const palette = await extractPalette(file);
  const tags = deriveFallbackTags(file.name, palette, width, height);

  return {
    id,
    name: file.name,
    path,
    type: file.type || 'image/*',
    size: file.size,
    lastModified: file.lastModified,
    importedAt: new Date().toISOString(),
    width,
    height,
    palette,
    tags,
    clipStatus: 'fallback',
    blob: file,
    url
  };
}

export async function createStableId(path: string, size: number, lastModified: number) {
  const payload = new TextEncoder().encode(`${path}:${size}:${lastModified}`);
  const digest = await crypto.subtle.digest('SHA-256', payload);
  return [...new Uint8Array(digest)]
    .slice(0, 12)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function readImageDimensions(url: string): Promise<{ width: number; height: number }> {
  const image = await loadImage(url);
  return {
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height
  };
}

export async function extractPalette(blob: Blob, colorCount = 6): Promise<ColorSwatch[]> {
  const url = URL.createObjectURL(blob);
  try {
    const image = await loadImage(url);
    const canvas = document.createElement('canvas');
    const maxEdge = 180;
    const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      return defaultPalette();
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const pixels: Array<[number, number, number]> = [];

    for (let index = 0; index < imageData.length; index += 16) {
      const alpha = imageData[index + 3];
      if (alpha < 180) {
        continue;
      }

      const rgb: [number, number, number] = [imageData[index], imageData[index + 1], imageData[index + 2]];
      if (isNearWhite(rgb) || isNearBlack(rgb)) {
        pixels.push(rgb);
      } else if (pixels.length % 2 === 0 || colorDistance(rgb, [128, 128, 128]) > 36) {
        pixels.push(rgb);
      }
    }

    if (pixels.length === 0) {
      return defaultPalette();
    }

    const colorMap = quantize(pixels, colorCount);
    const palette = colorMap ? colorMap.palette() : [];
    const total = Math.max(1, palette.length);

    return palette.slice(0, colorCount).map((rgb, index) => ({
      rgb,
      hex: rgbToHex(rgb),
      area: 1 / total,
      role: index === 0 ? 'dominant' : `accent ${index}`
    }));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function resizeBlobToDataUrl(blob: Blob, maxEdge = 336, mimeType = 'image/jpeg') {
  const url = URL.createObjectURL(blob);
  try {
    const image = await loadImage(url);
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) {
      return blobToDataUrl(blob);
    }

    context.fillStyle = '#fffaf0';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL(mimeType, 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function imageToCanvasDataUrl(
  url: string,
  width: number,
  height: number,
  mimeType = 'image/jpeg'
) {
  const image = await loadImage(url);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    return url;
  }

  context.fillStyle = '#fffaf0';
  context.fillRect(0, 0, width, height);
  drawImageCover(context, image, 0, 0, width, height);
  return canvas.toDataURL(mimeType, 0.86);
}

export function drawImageCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const boxRatio = width / height;
  const sourceWidth = imageRatio > boxRatio ? image.naturalHeight * boxRatio : image.naturalWidth;
  const sourceHeight = imageRatio > boxRatio ? image.naturalHeight : image.naturalWidth / boxRatio;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;

  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

export function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Image failed to load.'));
    image.src = url;
  });
}

export function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('File reader did not return a data URL.'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('File could not be read.'));
    reader.readAsDataURL(blob);
  });
}

function defaultPalette(): ColorSwatch[] {
  return [
    { hex: '#23211d', rgb: [35, 33, 29], area: 0.35, role: 'dominant' },
    { hex: '#9d6b53', rgb: [157, 107, 83], area: 0.25, role: 'accent 1' },
    { hex: '#cf9b45', rgb: [207, 155, 69], area: 0.2, role: 'accent 2' },
    { hex: '#50624b', rgb: [80, 98, 75], area: 0.12, role: 'accent 3' },
    { hex: '#426a75', rgb: [66, 106, 117], area: 0.08, role: 'accent 4' }
  ];
}

function isNearWhite([red, green, blue]: [number, number, number]) {
  return red > 235 && green > 235 && blue > 235;
}

function isNearBlack([red, green, blue]: [number, number, number]) {
  return red < 24 && green < 24 && blue < 24;
}

function colorDistance(a: [number, number, number], b: [number, number, number]) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}
