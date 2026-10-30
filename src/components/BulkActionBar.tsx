import type { CSSProperties, ReactNode } from 'react';
import Button, { type ButtonVariant } from './Button';

export interface BulkActionBarAction {
  key: string;
  label: ReactNode;
  onClick: () => void;
  variant?: ButtonVariant;
  /** Highlights the action as the current choice (e.g. copied format). */
  active?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  leadingIcon?: ReactNode;
}

export interface BulkActionBarProps {
  count: number;
  /** Overrides the default "N item(s)" label. */
  countLabel?: (count: number) => ReactNode;
  /** Selection totals or other summary content. */
  summary?: ReactNode;
  onClear?: () => void;
  clearLabel?: string;
  actions?: BulkActionBarAction[];
  /** Custom controls rendered between the actions and the danger action. */
  children?: ReactNode;
  dangerAction?: {
    label: ReactNode;
    onClick: () => void;
    disabled?: boolean;
    ariaLabel?: string;
  };
  position?: 'absolute' | 'sticky' | 'fixed';
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

function defaultCountLabel(count: number): string {
  return `${count} item${count === 1 ? '' : 's'}`;
}

/**
 * Selection toolbar for lists: clear selection, count/summary, a row of
 * secondary actions, a free-form slot and an optional danger action. It only
 * owns layout; every action is supplied by the caller.
 */
export default function BulkActionBar({
  count,
  countLabel,
  summary,
  onClear,
  clearLabel = 'Deselect',
  actions = [],
  children,
  dangerAction,
  position = 'absolute',
  ariaLabel = 'Selection actions',
  className,
  style,
}: BulkActionBarProps) {
  return (
    <div
      role="toolbar"
      aria-label={ariaLabel}
      className={['ui-bulk-action-bar', `is-${position}`, className ?? '']
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {onClear && (
        <button type="button" className="ui-bulk-action-clear" onClick={onClear}>
          ✕ {clearLabel}
        </button>
      )}
      <span className="ui-bulk-action-count">{(countLabel ?? defaultCountLabel)(count)}</span>
      {summary && <span className="ui-bulk-action-summary">{summary}</span>}
      <span className="ui-bulk-action-spacer" />
      {actions.map((action) => (
        <Button
          key={action.key}
          size="sm"
          variant={action.active ? 'primary' : (action.variant ?? 'secondary')}
          onClick={action.onClick}
          disabled={action.disabled}
          aria-label={action.ariaLabel}
          leadingIcon={action.leadingIcon}
        >
          {action.label}
        </Button>
      ))}
      {children}
      {dangerAction && (
        <Button
          size="sm"
          variant="danger"
          onClick={dangerAction.onClick}
          disabled={dangerAction.disabled}
          aria-label={dangerAction.ariaLabel}
        >
          {dangerAction.label}
        </Button>
      )}
    </div>
  );
}
