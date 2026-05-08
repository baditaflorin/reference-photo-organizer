import { describe, expect, it } from 'vitest';
import { colorTemperature, relativeLuminance, rgbToHex } from './color';

describe('color utilities', () => {
  it('formats rgb values as hex', () => {
    expect(rgbToHex([207, 155, 69])).toBe('#cf9b45');
    expect(rgbToHex([300, -20, 10])).toBe('#ff000a');
  });

  it('computes readable luminance ordering', () => {
    expect(relativeLuminance([255, 255, 255])).toBeGreaterThan(relativeLuminance([0, 0, 0]));
  });

  it('classifies palette temperature', () => {
    expect(colorTemperature([210, 120, 60])).toBe('warm');
    expect(colorTemperature([60, 120, 210])).toBe('cool');
    expect(colorTemperature([120, 122, 126])).toBe('balanced');
  });
});
