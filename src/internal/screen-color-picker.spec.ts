import { describe, it, expect } from 'vitest';
import { mapClientToPixel } from './screen-color-picker';

describe('mapClientToPixel', () => {
  it('maps viewport coordinates proportionally to the frame', () => {
    expect(mapClientToPixel(500, 250, 1000, 500, 2000, 1000)).toEqual({ x: 1000, y: 500 });
    expect(mapClientToPixel(0, 0, 1000, 500, 2000, 1000)).toEqual({ x: 0, y: 0 });
  });

  it('clamps to the image bounds', () => {
    expect(mapClientToPixel(2000, 2000, 1000, 500, 2000, 1000)).toEqual({ x: 1999, y: 999 });
    expect(mapClientToPixel(-10, -10, 1000, 500, 2000, 1000)).toEqual({ x: 0, y: 0 });
  });

  it('handles a zero-sized viewport defensively', () => {
    expect(mapClientToPixel(0, 0, 0, 0, 10, 10)).toEqual({ x: 0, y: 0 });
  });
});
