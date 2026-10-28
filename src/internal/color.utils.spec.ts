import { describe, it, expect } from 'vitest';
import {
  clamp,
  hexToHsv,
  hexToRgb,
  hsvToHex,
  hsvToRgb,
  normalizeHex,
  rgbToHex,
  rgbToHsv,
} from './color.utils';

describe('color utils', () => {
  it('normalizes hex values', () => {
    expect(normalizeHex('#4F7CFF')).toBe('#4f7cff');
    expect(normalizeHex('4f7cff')).toBe('#4f7cff');
    expect(normalizeHex('#abc')).toBeNull();
    expect(normalizeHex('red')).toBeNull();
  });

  it('converts hex <-> rgb', () => {
    expect(hexToRgb('#4f7cff')).toEqual({ r: 79, g: 124, b: 255 });
    expect(rgbToHex({ r: 79, g: 124, b: 255 })).toBe('#4f7cff');
  });

  it('round-trips hsv through hex', () => {
    for (const hex of ['#000000', '#ffffff', '#ff0000', '#00c9a7', '#8098b5', '#123456']) {
      expect(hsvToHex(hexToHsv(hex)!)).toBe(hex);
    }
  });

  it('converts rgb <-> hsv', () => {
    expect(rgbToHsv({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 1, v: 1 });
    expect(rgbToHsv({ r: 0, g: 255, b: 0 }).h).toBe(120);
    expect(hsvToRgb({ h: 240, s: 1, v: 1 })).toEqual({ r: 0, g: 0, b: 255 });
    expect(hsvToRgb({ h: 0, s: 0, v: 0 })).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('clamps numbers', () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-1, 0, 1)).toBe(0);
  });
});
