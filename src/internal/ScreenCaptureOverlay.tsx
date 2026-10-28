import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { mapClientToPixel } from './screen-color-picker';
import { rgbToHex } from './color.utils';

export interface ScreenCapture {
  dataUrl: string;
  width: number;
  height: number;
  context: CanvasRenderingContext2D;
}

export interface ScreenCaptureOverlayProps {
  capture: ScreenCapture;
  labels?: {
    pickFromScreen?: string;
    clickToPick?: string;
  };
  onPick: (hex: string) => void;
  onCancel: () => void;
}

export default function ScreenCaptureOverlay({
  capture,
  labels,
  onPick,
  onCancel,
}: ScreenCaptureOverlayProps) {
  const [hover, setHover] = useState<{ hex: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-label={labels?.pickFromScreen ?? 'Pick colour from screen'}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5000,
        cursor: 'crosshair',
        background: '#000',
      }}
      onPointerMove={(event) => {
        const point = mapClientToPixel(
          event.clientX,
          event.clientY,
          window.innerWidth,
          window.innerHeight,
          capture.width,
          capture.height,
        );
        const data = capture.context.getImageData(point.x, point.y, 1, 1).data;
        setHover({
          hex: rgbToHex({ r: data[0]!, g: data[1]!, b: data[2]! }),
          x: event.clientX,
          y: event.clientY,
        });
      }}
      onPointerLeave={() => setHover(null)}
      onClick={() => {
        if (hover) onPick(hover.hex);
        else onCancel();
      }}
    >
      <img
        src={capture.dataUrl}
        alt=""
        draggable={false}
        style={{
          width: '100vw',
          height: '100vh',
          objectFit: 'fill',
          display: 'block',
          userSelect: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--ui-surface)',
          border: '1px solid var(--ui-border)',
          borderRadius: 8,
          padding: '6px 12px',
          color: 'var(--ui-text-2)',
          fontSize: 12,
        }}
      >
        {labels?.clickToPick ?? 'Click to pick · Esc to cancel'}
      </div>
      {hover && (
        <div
          style={{
            position: 'fixed',
            left: hover.x + 16,
            top: hover.y + 16,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--ui-surface)',
            border: '1px solid var(--ui-border)',
            borderRadius: 8,
            padding: '6px 8px',
            boxShadow: 'var(--ui-shadow)',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              background: hover.hex,
              border: '1px solid var(--ui-border)',
            }}
          />
          <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--ui-text)' }}>
            {hover.hex.toUpperCase()}
          </span>
        </div>
      )}
    </div>,
    document.body,
  );
}
