import { drawImageCover, loadImage } from '../library/imageProcessing';
import type { ExportOptions, ImageAsset } from '../library/types';

const BOARD_WIDTH = 1800;
const GAP = 24;
const PADDING = 44;

export async function createMoodBoardPng(images: ImageAsset[], options: ExportOptions) {
  const columns = images.length <= 4 ? 2 : images.length <= 12 ? 3 : 4;
  const tileWidth = Math.floor((BOARD_WIDTH - PADDING * 2 - GAP * (columns - 1)) / columns);
  const placements = await Promise.all(
    images.map(async (asset, index) => {
      const image = await loadImage(asset.url);
      const ratio = image.naturalHeight / Math.max(1, image.naturalWidth);
      const height = Math.max(260, Math.min(520, Math.round(tileWidth * ratio)));
      return { asset, image, index, height };
    })
  );

  const columnHeights = Array.from({ length: columns }, () => PADDING + 86);
  const laidOut = placements.map((item) => {
    const column = columnHeights.indexOf(Math.min(...columnHeights));
    const x = PADDING + column * (tileWidth + GAP);
    const y = columnHeights[column];
    columnHeights[column] += item.height + GAP + (options.showLabels ? 92 : 26);
    return { ...item, x, y, width: tileWidth };
  });

  const canvas = document.createElement('canvas');
  canvas.width = BOARD_WIDTH;
  canvas.height = Math.max(...columnHeights) + PADDING;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas export is not available.');
  }

  context.fillStyle = '#f5f2ea';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#23211d';
  context.font = '700 48px system-ui, sans-serif';
  context.fillText(options.title || 'Reference Photo Organizer', PADDING, 70);
  context.font = '500 22px system-ui, sans-serif';
  context.fillStyle = '#5b554b';
  context.fillText(`${images.length} references - palettes and tags`, PADDING, 110);

  for (const item of laidOut) {
    drawTile(context, item.asset, item.image, item.x, item.y, item.width, item.height, options.showLabels);
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('PNG export failed.'));
      }
    }, 'image/png');
  });
}

function drawTile(
  context: CanvasRenderingContext2D,
  asset: ImageAsset,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  showLabels: boolean
) {
  context.save();
  context.fillStyle = '#fffaf0';
  roundedRect(context, x, y, width, height + (showLabels ? 82 : 16), 8);
  context.fill();
  drawImageCover(context, image, x, y, width, height);

  const swatchWidth = width / Math.max(1, asset.palette.length);
  asset.palette.forEach((swatch, index) => {
    context.fillStyle = swatch.hex;
    context.fillRect(x + swatchWidth * index, y + height, swatchWidth + 1, 16);
  });

  if (showLabels) {
    context.fillStyle = '#23211d';
    context.font = '700 20px system-ui, sans-serif';
    context.fillText(truncate(asset.name, 32), x + 14, y + height + 44);
    context.font = '500 16px system-ui, sans-serif';
    context.fillStyle = '#5b554b';
    context.fillText(truncate(asset.tags.map((tag) => tag.label).join(', '), 52), x + 14, y + height + 70);
  }
  context.restore();
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function truncate(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 3)}...` : value;
}
