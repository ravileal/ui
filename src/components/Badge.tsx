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
  /** Turns the icon + label into a button that calls this when activated. */
  onClick?: () => void;
  /** Turns the icon + label into a link to this URL instead of a button. */
  href?: string;
  /** Toggle state of the trigger; `aria-pressed` is emitted only when set. */
  pressed?: boolean;
  /** Disables the trigger and dims the chip; the remove button stays usable. */
  disabled?: boolean;
  /** Native tooltip on the trigger control. */
  title?: string;
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
  onClick,
  href,
  pressed,
  disabled = false,
  title,
  className,
  style,
}: ChipProps) {
  // A bare chip stays the inert span TagInput composes; only an explicit
  // onClick/href turns it into a trigger, so no consumer's DOM shifts.
  const interactive = onClick !== undefined || href !== undefined;

  const content = (
    <>
      {leadingIcon && (
        <span className="ui-chip-icon" aria-hidden="true">
          {leadingIcon}
        </span>
      )}
      <span className="ui-chip-label">{children}</span>
    </>
  );

  // The remove button is never nested inside the trigger: it stays a sibling
  // of the button/anchor, otherwise one control would live inside another.
  const trigger =
    href !== undefined ? (
      <a
        className="ui-chip-button"
        href={href}
        title={title}
        aria-pressed={pressed}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        onClick={disabled ? (event) => event.preventDefault() : onClick}
      >
        {content}
      </a>
    ) : (
      <button
        type="button"
        className="ui-chip-button"
        title={title}
        aria-pressed={pressed}
        disabled={disabled}
        onClick={onClick}
      >
        {content}
      </button>
    );

  return (
    <span
      className={[
        'ui-badge',
        'ui-chip',
        `ui-badge--${variant}`,
        `ui-badge--${tone}`,
        interactive ? 'ui-chip--interactive' : '',
        disabled ? 'ui-chip--disabled' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {interactive ? trigger : content}
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
