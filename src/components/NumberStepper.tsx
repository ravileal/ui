import { useEffect, useRef, useState, type CSSProperties } from 'react';

const buttonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 22,
  flex: 1,
  border: 'none',
  background: 'none',
  color: 'var(--ui-text-3)',
  cursor: 'pointer',
  fontSize: 8,
  lineHeight: 1,
  padding: 0,
};

export interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  ariaLabel: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Numeric input without the native browser spinner: custom increase/decrease
 * buttons, mouse-wheel stepping and keyboard arrows.
 */
export function NumberStepper({
  value,
  onChange,
  ariaLabel,
  min = 0,
  max = 255,
  step = 1,
  className,
  style,
}: NumberStepperProps) {
  const [text, setText] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const clampValue = (raw: number) => Math.min(max, Math.max(min, Math.round(raw)));

  const commit = (raw: number) => {
    const next = clampValue(raw);
    setText(String(next));
    onChange(next);
  };

  const stepBy = (direction: 1 | -1) => {
    commit((Number(text) || 0) + direction * step);
  };

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      commit((Number(text) || 0) + (event.deltaY < 0 ? step : -step));
    };
    input.addEventListener('wheel', onWheel, { passive: false });
    return () => input.removeEventListener('wheel', onWheel);
    // reattach with the current text/step so the wheel uses the latest value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, step, min, max]);

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        height: 30,
        borderRadius: 8,
        border: '1px solid var(--ui-border)',
        background: 'var(--ui-surface)',
        overflow: 'hidden',
        ...style,
      }}
    >
      <input
        ref={inputRef}
        aria-label={ariaLabel}
        inputMode="numeric"
        value={text}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^\d]/g, '');
          setText(digits);
          if (digits !== '') onChange(clampValue(Number(digits)));
        }}
        onBlur={() => {
          const parsed = Number(text);
          commit(Number.isFinite(parsed) && text !== '' ? parsed : value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            stepBy(1);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            stepBy(-1);
          } else if (e.key === 'Enter') {
            e.preventDefault();
            inputRef.current?.blur();
          }
        }}
        style={{
          width: '100%',
          minWidth: 0,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          color: 'var(--ui-text)',
          textAlign: 'center',
          fontSize: 12,
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid var(--ui-border)',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          aria-label={`Increase ${ariaLabel}`}
          onClick={() => stepBy(1)}
          style={buttonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ui-surface-2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          ▲
        </button>
        <button
          type="button"
          aria-label={`Decrease ${ariaLabel}`}
          onClick={() => stepBy(-1)}
          style={{ ...buttonStyle, borderTop: '1px solid var(--ui-border)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ui-surface-2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          ▼
        </button>
      </div>
    </div>
  );
}
