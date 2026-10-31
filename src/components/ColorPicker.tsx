import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { usePopover } from '../internal/usePopover';
import {
  clamp,
  hexToHsv,
  hsvToHex,
  hsvToRgb,
  normalizeHex,
  rgbToHsv,
  type Hsv,
} from '../internal/color.utils';
import { NumberStepper } from './NumberStepper';
import { supportsScreenPick } from '../internal/screen-color-picker';
import ScreenCaptureOverlay, { type ScreenCapture } from '../internal/ScreenCaptureOverlay';

const inputStyle: CSSProperties = {
  padding: '7px 10px',
  borderRadius: 8,
  border: '1px solid var(--ui-border)',
  background: 'var(--ui-surface)',
  color: 'var(--ui-text)',
  fontSize: 12,
  fontFamily: 'monospace',
  outline: 'none',
  width: '100%',
};

const iconButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  flexShrink: 0,
  borderRadius: 8,
  border: '1px solid var(--ui-border)',
  background: 'none',
  color: 'var(--ui-text-2)',
  cursor: 'pointer',
};

const handleStyle: CSSProperties = {
  position: 'absolute',
  width: 14,
  height: 14,
  borderRadius: '50%',
  border: '2px solid var(--ui-on-accent)',
  boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.45)',
  transform: 'translate(-50%, -50%)',
  pointerEvents: 'none',
};

const DEFAULT_COLOR = '#8098b5';

type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> };

export interface ColorPickerLabels {
  picker?: string;
  saturationAndBrightness?: string;
  hue?: string;
  hexColor?: string;
  pickFromScreen?: string;
  presetColors?: string;
  presetColor?: (hex: string) => string;
  red?: string;
  green?: string;
  blue?: string;
  cancel?: string;
  done?: string;
  clickToPick?: string;
  saturationValueText?: (saturation: number, brightness: number) => string;
}

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  /** Swatches offered by the caller (customizable per usage). */
  presets: string[];
  ariaLabel?: string;
  labels?: ColorPickerLabels;
  className?: string;
  style?: CSSProperties;
}

/**
 * Full colour picker styled with the library tokens (replaces the native
 * browser dialog): saturation/brightness area, hue slider, hex + RGB fields,
 * optional screen eyedropper and preset swatches.
 */
export function ColorPicker({
  value,
  onChange,
  presets,
  ariaLabel = 'Color',
  labels,
  className,
  style,
}: ColorPickerProps) {
  const color = normalizeHex(value) ?? DEFAULT_COLOR;
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(color) ?? { h: 0, s: 0, v: 1 });
  const [hexText, setHexText] = useState(color.toUpperCase());
  const lastEmitted = useRef(color);
  const originalColor = useRef(color);
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const draggingSv = useRef(false);
  const draggingHue = useRef(false);

  /** Undo every change made since the picker was opened. */
  const revert = () => {
    const original = originalColor.current;
    if (lastEmitted.current === original) return;
    lastEmitted.current = original;
    setHsv(hexToHsv(original) ?? { h: 0, s: 0, v: 1 });
    setHexText(original.toUpperCase());
    onChange(original);
  };

  const { open, pos, triggerRef, menuRef, openMenu, closeMenu } = usePopover({
    maxHeight: 520,
    minWidth: 272,
    onDismiss: revert,
  });

  useEffect(() => {
    const normalized = normalizeHex(value);
    if (normalized && normalized !== lastEmitted.current) {
      lastEmitted.current = normalized;
      setHsv(hexToHsv(normalized) ?? { h: 0, s: 0, v: 1 });
      setHexText(normalized.toUpperCase());
    }
  }, [value]);

  const emit = (next: Hsv) => {
    const hex = hsvToHex(next);
    lastEmitted.current = hex;
    setHsv(next);
    setHexText(hex.toUpperCase());
    onChange(hex);
  };

  const toggleMenu = () => {
    if (open) {
      closeMenu();
      return;
    }
    originalColor.current = color;
    lastEmitted.current = color;
    setHsv(hexToHsv(color) ?? { h: 0, s: 0, v: 1 });
    setHexText(color.toUpperCase());
    openMenu();
  };

  const cancel = () => {
    revert();
    closeMenu(true);
  };

  const rgb = hsvToRgb(hsv);
  const hueColor = hsvToHex({ h: hsv.h, s: 1, v: 1 });

  const updateSv = (clientX: number, clientY: number) => {
    const el = svRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    emit({
      ...hsv,
      s: clamp((clientX - rect.left) / rect.width, 0, 1),
      v: 1 - clamp((clientY - rect.top) / rect.height, 0, 1),
    });
  };

  const updateHue = (clientX: number) => {
    const el = hueRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width) return;
    emit({ ...hsv, h: clamp((clientX - rect.left) / rect.width, 0, 1) * 360 });
  };

  const [eyedropper, setEyedropper] = useState<EyeDropperCtor | null>(null);
  const [canScreenPick, setCanScreenPick] = useState(false);
  const [capture, setCapture] = useState<ScreenCapture | null>(null);

  useEffect(() => {
    const ctor = (window as unknown as { EyeDropper?: EyeDropperCtor }).EyeDropper ?? null;
    // `EyeDropper` is a class (a function): setState would invoke it as an
    // updater if it were passed directly.
    setEyedropper(() => ctor);
    setCanScreenPick(supportsScreenPick());
  }, []);

  const pickWithEyeDropper = async () => {
    if (!eyedropper) return;
    try {
      const result = await new eyedropper().open();
      const parsed = normalizeHex(result.sRGBHex);
      if (parsed) emit(hexToHsv(parsed) ?? hsv);
    } catch {
      // cancelled by the user
    }
  };

  /**
   * Native EyeDropper first: the OS picker needs no screen-sharing permission.
   * Only browsers without the EyeDropper API fall back to a frozen screen
   * capture with a live colour preview.
   */
  const startScreenPick = async () => {
    if (eyedropper) {
      await pickWithEyeDropper();
      return;
    }
    if (!supportsScreenPick()) return;
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.muted = true;
      await video.play();
      if (!video.videoWidth) {
        await new Promise<void>((resolve) => {
          video.addEventListener('loadedmetadata', () => resolve(), { once: true });
        });
      }
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('canvas unavailable');
      context.drawImage(video, 0, 0);
      setCapture({
        dataUrl: canvas.toDataURL('image/png'),
        width: canvas.width,
        height: canvas.height,
        context,
      });
    } catch {
      // permission denied/unsupported
    } finally {
      stream?.getTracks().forEach((track) => track.stop());
    }
  };

  return (
    <div
      className={className}
      style={{ display: 'inline-flex', flexShrink: 0, width: 148, ...style }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="ui-dropdown-trigger is-md"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggleMenu}
      >
        <span className="ui-dropdown-dot" style={{ background: color }} />
        <span className="ui-dropdown-value" style={{ fontSize: 12, fontFamily: 'monospace' }}>
          {color.toUpperCase()}
        </span>
        <span className="ui-dropdown-caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            className="ui-dropdown-menu"
            role="dialog"
            aria-label={labels?.picker ?? `${ariaLabel} picker`}
            style={{
              left: pos.left,
              top: pos.top,
              bottom: pos.bottom,
              width: pos.width,
              maxHeight: pos.maxHeight,
            }}
          >
            <div className="ui-color-picker-panel">
              <div
                ref={svRef}
                role="slider"
                aria-label={labels?.saturationAndBrightness ?? 'Saturation and brightness'}
                aria-valuetext={
                  labels?.saturationValueText?.(Math.round(hsv.s * 100), Math.round(hsv.v * 100)) ??
                  `Saturation ${Math.round(hsv.s * 100)}%, brightness ${Math.round(hsv.v * 100)}%`
                }
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    emit({ ...hsv, s: clamp(hsv.s - 0.02, 0, 1) });
                  } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    emit({ ...hsv, s: clamp(hsv.s + 0.02, 0, 1) });
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    emit({ ...hsv, v: clamp(hsv.v + 0.02, 0, 1) });
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    emit({ ...hsv, v: clamp(hsv.v - 0.02, 0, 1) });
                  }
                }}
                onPointerDown={(e) => {
                  draggingSv.current = true;
                  updateSv(e.clientX, e.clientY);
                }}
                onPointerMove={(e) => {
                  if (draggingSv.current) updateSv(e.clientX, e.clientY);
                }}
                onPointerUp={() => {
                  draggingSv.current = false;
                }}
                onPointerLeave={() => {
                  draggingSv.current = false;
                }}
                style={{
                  position: 'relative',
                  height: 150,
                  borderRadius: 8,
                  cursor: 'crosshair',
                  touchAction: 'none',
                  background: `linear-gradient(to top, #000, rgba(0,0,0,0)), linear-gradient(to right, #fff, ${hueColor})`,
                }}
              >
                <span
                  style={{
                    ...handleStyle,
                    left: `${hsv.s * 100}%`,
                    top: `${(1 - hsv.v) * 100}%`,
                    background: hsvToHex(hsv),
                  }}
                />
              </div>

              <div
                ref={hueRef}
                role="slider"
                aria-label={labels?.hue ?? 'Hue'}
                aria-valuemin={0}
                aria-valuemax={360}
                aria-valuenow={Math.round(hsv.h)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    emit({ ...hsv, h: (hsv.h - 2 + 360) % 360 });
                  } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    emit({ ...hsv, h: (hsv.h + 2) % 360 });
                  } else if (e.key === 'Home') {
                    e.preventDefault();
                    emit({ ...hsv, h: 0 });
                  } else if (e.key === 'End') {
                    e.preventDefault();
                    emit({ ...hsv, h: 359 });
                  }
                }}
                onPointerDown={(e) => {
                  draggingHue.current = true;
                  updateHue(e.clientX);
                }}
                onPointerMove={(e) => {
                  if (draggingHue.current) updateHue(e.clientX);
                }}
                onPointerUp={() => {
                  draggingHue.current = false;
                }}
                onPointerLeave={() => {
                  draggingHue.current = false;
                }}
                style={{
                  position: 'relative',
                  height: 12,
                  borderRadius: 6,
                  cursor: 'pointer',
                  touchAction: 'none',
                  background:
                    'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
                }}
              >
                <span
                  style={{
                    ...handleStyle,
                    left: `${(hsv.h / 360) * 100}%`,
                    top: '50%',
                    width: 16,
                    height: 16,
                    background: hueColor,
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: 32,
                    height: 32,
                    flexShrink: 0,
                    borderRadius: 8,
                    background: hsvToHex(hsv),
                    border: '1px solid var(--ui-border)',
                  }}
                />
                <input
                  aria-label={labels?.hexColor ?? 'Hex colour'}
                  value={hexText}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setHexText(raw);
                    const parsed = normalizeHex(raw);
                    if (parsed) {
                      lastEmitted.current = parsed;
                      setHsv(hexToHsv(parsed) ?? hsv);
                      onChange(parsed);
                    }
                  }}
                  onBlur={() => {
                    if (!normalizeHex(hexText)) setHexText(hsvToHex(hsv).toUpperCase());
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return;
                    const parsed = normalizeHex(hexText);
                    if (parsed) {
                      e.preventDefault();
                      emit(hexToHsv(parsed) ?? hsv);
                      closeMenu(true);
                    }
                  }}
                  style={inputStyle}
                />
                {(canScreenPick || eyedropper) && (
                  <button
                    type="button"
                    aria-label={labels?.pickFromScreen ?? 'Pick colour from screen'}
                    title={labels?.pickFromScreen ?? 'Pick colour from screen'}
                    onClick={() => void startScreenPick()}
                    style={iconButtonStyle}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m19 3-4 4" />
                      <path d="M14.5 4.5 19.5 9.5" />
                      <path d="M12.5 6.5 17.5 11.5 8 21H3v-5z" />
                    </svg>
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {(['r', 'g', 'b'] as const).map((channel, index) => (
                  <label
                    key={channel}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      fontSize: 11,
                      color: 'var(--ui-text-2)',
                    }}
                  >
                    {['R', 'G', 'B'][index]}
                    <NumberStepper
                      ariaLabel={
                        [labels?.red ?? 'Red', labels?.green ?? 'Green', labels?.blue ?? 'Blue'][
                          index
                        ]!
                      }
                      value={rgb[channel]}
                      min={0}
                      max={255}
                      onChange={(next) => emit(rgbToHsv({ ...rgb, [channel]: next }))}
                    />
                  </label>
                ))}
              </div>

              <div
                role="group"
                aria-label={labels?.presetColors ?? 'Preset colours'}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 24px)',
                  justifyContent: 'space-between',
                  gap: 8,
                  width: '100%',
                }}
              >
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    aria-label={labels?.presetColor?.(preset) ?? `Colour ${preset}`}
                    title={preset}
                    onClick={() => emit(hexToHsv(preset) ?? hsv)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: preset,
                      border:
                        color.toLowerCase() === preset.toLowerCase()
                          ? '2px solid var(--ui-text)'
                          : '2px solid transparent',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  aria-label={labels?.cancel ?? 'Cancel'}
                  onClick={cancel}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 8,
                    background: 'none',
                    color: 'var(--ui-text-2)',
                    fontWeight: 600,
                    fontSize: 12,
                    border: '1px solid var(--ui-border)',
                    cursor: 'pointer',
                  }}
                >
                  {labels?.cancel ?? 'Cancel'}
                </button>
                <button
                  type="button"
                  aria-label={labels?.done ?? 'Done'}
                  onClick={() => closeMenu(true)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 8,
                    background: 'var(--ui-accent)',
                    color: 'var(--ui-on-accent)',
                    fontWeight: 600,
                    fontSize: 12,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {labels?.done ?? 'Done'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {capture && (
        <ScreenCaptureOverlay
          capture={capture}
          labels={labels}
          onPick={(hex) => {
            emit(hexToHsv(hex) ?? hsv);
            closeMenu(true);
            setCapture(null);
          }}
          onCancel={() => setCapture(null)}
        />
      )}
    </div>
  );
}
