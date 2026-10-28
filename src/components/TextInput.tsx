import { forwardRef, type CSSProperties, type InputHTMLAttributes, type ReactNode } from 'react';

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md';
  invalid?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  onClear?: () => void;
  clearLabel?: string;
  wrapperClassName?: string;
  wrapperStyle?: CSSProperties;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    size = 'md',
    invalid = false,
    leadingIcon,
    trailingIcon,
    onClear,
    clearLabel = 'Clear',
    className,
    wrapperClassName,
    style,
    wrapperStyle,
    disabled,
    value,
    ...props
  },
  ref,
) {
  const showClear = Boolean(onClear) && value != null && value !== '';

  return (
    <div
      className={[
        'ui-input-wrap',
        `ui-input-wrap--${size}`,
        invalid ? 'is-invalid' : '',
        disabled ? 'is-disabled' : '',
        wrapperClassName ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={wrapperStyle}
    >
      {leadingIcon && (
        <span className="ui-input-icon" aria-hidden="true">
          {leadingIcon}
        </span>
      )}
      <input
        ref={ref}
        className={['ui-input', className ?? ''].filter(Boolean).join(' ')}
        style={style}
        value={value}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        {...props}
      />
      {trailingIcon && (
        <span className="ui-input-icon" aria-hidden="true">
          {trailingIcon}
        </span>
      )}
      {showClear && (
        <button
          type="button"
          className="ui-input-clear"
          aria-label={clearLabel}
          onClick={onClear}
          disabled={disabled}
        >
          ×
        </button>
      )}
    </div>
  );
});

export default TextInput;
