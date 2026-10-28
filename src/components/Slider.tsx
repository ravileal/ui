import { useId, type CSSProperties } from 'react';

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  ariaLabel?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  disabled?: boolean;
  id?: string;
  className?: string;
  style?: CSSProperties;
}

export default function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  ariaLabel,
  showValue = true,
  formatValue = (current) => String(current),
  disabled = false,
  id,
  className,
  style,
}: SliderProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={['ui-slider', className ?? ''].filter(Boolean).join(' ')} style={style}>
      {(label || showValue) && (
        <div className="ui-slider-head">
          {label && (
            <label htmlFor={inputId} className="ui-slider-label">
              {label}
            </label>
          )}
          {showValue && <span className="ui-slider-value">{formatValue(value)}</span>}
        </div>
      )}
      <input
        id={inputId}
        type="range"
        className="ui-slider-input"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={ariaLabel ?? (label ? undefined : 'Slider')}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}
