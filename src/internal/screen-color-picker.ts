export interface PixelPoint {
  x: number;
  y: number;
}

/**
 * Maps a viewport pointer position to a pixel of the captured screen frame.
 * The overlay renders the frozen frame stretched to the viewport, so the
 * mapping is linear; values are clamped to the image bounds.
 */
export function mapClientToPixel(
  clientX: number,
  clientY: number,
  viewportWidth: number,
  viewportHeight: number,
  imageWidth: number,
  imageHeight: number,
): PixelPoint {
  const safeWidth = Math.max(1, viewportWidth);
  const safeHeight = Math.max(1, viewportHeight);
  return {
    x: Math.min(imageWidth - 1, Math.max(0, Math.floor((clientX / safeWidth) * imageWidth))),
    y: Math.min(imageHeight - 1, Math.max(0, Math.floor((clientY / safeHeight) * imageHeight))),
  };
}

/** Whether the browser can capture the screen for the live colour preview. */
export function supportsScreenPick(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getDisplayMedia === 'function'
  );
}
