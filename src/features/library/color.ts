import type { ColorSwatch } from './types';

export function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function rgbToHex(rgb: [number, number, number]) {
  return `#${rgb.map((channel) => clampChannel(channel).toString(16).padStart(2, '0')).join('')}`;
}

export function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(normalized)) {
    return [0, 0, 0];
  }

  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16)
  ];
}

export function relativeLuminance([red, green, blue]: [number, number, number]) {
  const transform = (channel: number) => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * transform(red) + 0.7152 * transform(green) + 0.0722 * transform(blue);
}

export function colorTemperature([red, , blue]: [number, number, number]) {
  const delta = red - blue;
  if (delta > 28) {
    return 'warm';
  }
  if (delta < -28) {
    return 'cool';
  }
  return 'balanced';
}

export function colorSaturation([red, green, blue]: [number, number, number]) {
  const max = Math.max(red, green, blue) / 255;
  const min = Math.min(red, green, blue) / 255;
  const lightness = (max + min) / 2;
  if (max === min) {
    return 0;
  }
  return lightness > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
}

export function averagePaletteColor(palette: ColorSwatch[]): [number, number, number] {
  if (palette.length === 0) {
    return [128, 128, 128];
  }

  const total = palette.reduce(
    (acc, swatch) => {
      acc[0] += swatch.rgb[0] * swatch.area;
      acc[1] += swatch.rgb[1] * swatch.area;
      acc[2] += swatch.rgb[2] * swatch.area;
      acc[3] += swatch.area;
      return acc;
    },
    [0, 0, 0, 0]
  );

  const weight = total[3] || 1;
  return [total[0] / weight, total[1] / weight, total[2] / weight].map(clampChannel) as [
    number,
    number,
    number
  ];
}

export function readableTextColor(hex: string) {
  return relativeLuminance(hexToRgb(hex)) > 0.48 ? '#23211d' : '#fffaf0';
}

export function paletteSignature(palette: ColorSwatch[]) {
  return palette.map((swatch) => swatch.hex).join(' ');
}
