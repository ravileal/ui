import { useId, type CSSProperties, type ReactNode } from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  id?: string;
  name?: string;
  className?: string;
  style?: CSSProperties;
}

export default function Switch({
  checked,
  onChange,
  label,
  description,
  ariaLabel,
  disabled = false,
  size = 'md',
  id,
  name,
  className,
  style,
}: SwitchProps) {
  const generatedId = useId();
  const labelId = `${id ?? generatedId}-label`;
  const descriptionId = `${id ?? generatedId}-description`;
  const labelledBy = !ariaLabel && label ? labelId : undefined;
  const accessibleLabel = ariaLabel ?? 'Toggle';

  return (
    <div
      className={['ui-switch-row', disabled ? 'is-disabled' : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {(label || description) && (
        <div className="ui-switch-copy">
          {label && (
            <span id={labelId} className="ui-switch-label">
              {label}
            </span>
          )}
          {description && (
            <span id={descriptionId} className="ui-switch-description">
              {description}
            </span>
          )}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={labelledBy ? undefined : accessibleLabel}
        aria-labelledby={labelledBy}
        aria-describedby={description ? descriptionId : undefined}
        disabled={disabled}
        name={name}
        className={['ui-switch', `ui-switch--${size}`, checked ? 'is-checked' : '']
          .filter(Boolean)
          .join(' ')}
        onClick={() => onChange(!checked)}
      >
        <span className="ui-switch-thumb" aria-hidden="true" />
      </button>
    </div>
  );
}
