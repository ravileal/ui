import type { CSSProperties, ReactNode } from 'react';
import type { Tone } from '../internal/tone';

export type BadgeVariant = 'soft' | 'solid' | 'outline';

export interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Badge({
  children,
  tone = 'neutral',
  variant = 'soft',
  dot = false,
  className,
  style,
}: BadgeProps) {
  return (
    <span
      className={['ui-badge', `ui-badge--${variant}`, `ui-badge--${tone}`, className ?? '']
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {dot && <span className="ui-badge-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

export interface ChipProps {
  children: ReactNode;
  tone?: Tone;
  variant?: BadgeVariant;
  leadingIcon?: ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
  className?: string;
  style?: CSSProperties;
}

export function Chip({
  children,
  tone = 'neutral',
  variant = 'soft',
  leadingIcon,
  onRemove,
  removeLabel = 'Remove',
  className,
  style,
}: ChipProps) {
  return (
    <span
      className={[
        'ui-badge',
        'ui-chip',
        `ui-badge--${variant}`,
        `ui-badge--${tone}`,
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {leadingIcon && (
        <span className="ui-chip-icon" aria-hidden="true">
          {leadingIcon}
        </span>
      )}
      <span className="ui-chip-label">{children}</span>
      {onRemove && (
        <button
          type="button"
          className="ui-chip-remove"
          aria-label={removeLabel}
          onClick={onRemove}
        >
          ×
        </button>
      )}
    </span>
  );
}
