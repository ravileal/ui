import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import TextInput from './TextInput';

export interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  width?: number | string;
  ariaLabel?: string;
  name?: string;
  id?: string;
  labelHidden?: boolean;
  className?: string;
  style?: CSSProperties;
}

const NUMERIC_PATTERN = /^-?\d*\.?\d*$/;

/**
 * Small numeric input built on `TextInput`. The typed text is kept locally so
 * an empty field and a lone minus are editable; the parsed, clamped number is
 * emitted as soon as the text parses, and blur repairs an invalid draft.
 */
export default function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
  width = 72,
  ariaLabel,
  name,
  id,
  labelHidden = false,
  className,
  style,
}: NumberFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [text, setText] = useState(String(value));
  const lastEmitted = useRef(value);

  useEffect(() => {
    // Only follow external updates: an update caused by typing was already
    // emitted here, so resetting the text would swallow a trailing '.' or '-'.
    if (value !== lastEmitted.current) {
      lastEmitted.current = value;
      setText(String(value));
    }
  }, [value]);

  const clamp = (raw: number) => {
    let next = raw;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    return next;
  };

  const handleChange = (next: string) => {
    if (!NUMERIC_PATTERN.test(next)) return;
    setText(next);
    if (next === '' || next === '-' || next === '.' || next === '-.') return;
    const parsed = Number(next);
    if (!Number.isFinite(parsed)) return;
    const clamped = clamp(parsed);
    lastEmitted.current = clamped;
    onChange(clamped);
  };

  const stepBy = (direction: 1 | -1) => {
    const parsed = Number(text);
    const base = Number.isFinite(parsed) && text !== '' ? parsed : lastEmitted.current;
    const next = clamp(base + direction * step);
    lastEmitted.current = next;
    setText(String(next));
    onChange(next);
  };

  const handleBlur = () => {
    const parsed = Number(text);
    if (text === '' || !Number.isFinite(parsed)) {
      const restored = clamp(lastEmitted.current);
      lastEmitted.current = restored;
      setText(String(restored));
      return;
    }
    const clamped = clamp(parsed);
    setText(String(clamped));
    if (clamped !== lastEmitted.current) {
      lastEmitted.current = clamped;
      onChange(clamped);
    }
  };

  return (
    <div
      className={[
        'ui-number-field',
        labelHidden ? 'ui-number-field--label-hidden' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <label
        className={['ui-number-field-label', labelHidden ? 'ui-visually-hidden' : '']
          .filter(Boolean)
          .join(' ')}
        htmlFor={inputId}
      >
        {label}
      </label>
      {/* `type="text"` with `inputMode`: a native number input sanitises the
          value as you type, so Chrome drops the leading minus of "-100" and the
          field can never reach its negative range. NumberStepper makes the same
          choice; arrow keys are handled below so stepping still works. */}
      <TextInput
        size="sm"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={text}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={handleBlur}
        onKeyDown={(event) => {
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            stepBy(1);
          } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            stepBy(-1);
          }
        }}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        name={name}
        id={inputId}
        aria-label={ariaLabel}
        wrapperClassName="ui-number-field-control"
        wrapperStyle={{ width }}
      />
    </div>
  );
}
