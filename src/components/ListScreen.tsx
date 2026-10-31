import type { CSSProperties, ReactNode } from 'react';

export interface ListScreenProps {
  title: string;
  subtitle: string;
  action?: { label: string; onClick: () => void };
  /** Custom header actions; takes precedence over `action`. */
  actions?: ReactNode;
  children: ReactNode;
  testId?: string;
  maxWidth?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Shell for list/configuration screens: scroll page, title/subtitle header and
 * an optional primary action on the right. The content is fully customizable.
 */
export function ListScreen({
  title,
  subtitle,
  action,
  actions,
  children,
  testId,
  maxWidth = 700,
  className,
  style,
}: ListScreenProps) {
  return (
    <div
      style={style}
      className={['ui-list-screen', 'ui-scroll-y', className ?? ''].filter(Boolean).join(' ')}
    >
      <div className="ui-list-screen-inner" style={{ maxWidth }} data-testid={testId}>
        <div className="ui-list-screen-head">
          <div>
            <h1
              className="ui-list-screen-title"
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--ui-text)',
                letterSpacing: '-0.5px',
              }}
            >
              {title}
            </h1>
            <p
              className="ui-list-screen-subtitle"
              style={{ color: 'var(--ui-text-2)', fontSize: 13 }}
            >
              {subtitle}
            </p>
          </div>
          {actions ? (
            <div className="ui-list-screen-actions">{actions}</div>
          ) : (
            action && (
              <button type="button" className="ui-list-screen-action" onClick={action.onClick}>
                {action.label}
              </button>
            )
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

/** Card that hosts an inline list (rows + embedded editors). */
export function ListCard({
  children,
  testId,
  className,
  style,
}: {
  children: ReactNode;
  testId?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      data-testid={testId}
      className={className}
      style={{
        background: 'var(--ui-surface)',
        border: '1px solid var(--ui-border)',
        borderRadius: 12,
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Row wrapper with the shared spacing/hover and optional divider. */
export function ListRow({
  children,
  style,
  className,
  borderBottom = true,
  selected = false,
  onClick,
  ariaLabel,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  borderBottom?: boolean;
  selected?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  return (
    <div
      className={className}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick ? selected : undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '13px 20px',
        gap: 12,
        borderBottom: borderBottom ? '1px solid var(--ui-border)' : 'none',
        cursor: onClick ? 'pointer' : undefined,
        background: selected ? 'var(--ui-surface-2)' : 'transparent',
        boxShadow: selected ? 'inset 2px 0 0 var(--ui-accent)' : undefined,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.background = 'var(--ui-surface-2)';
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.background = 'transparent';
      }}
    >
      {children}
    </div>
  );
}

/** Search input used above the lists. */
export function ListSearch({
  ariaLabel,
  placeholder,
  value,
  onChange,
  className,
  style,
}: {
  ariaLabel: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <input
      aria-label={ariaLabel}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      style={{
        padding: '9px 12px',
        borderRadius: 8,
        border: '1px solid var(--ui-border)',
        background: 'var(--ui-surface)',
        color: 'var(--ui-text)',
        fontSize: 13,
        outline: 'none',
        width: '100%',
        marginBottom: 16,
        ...style,
      }}
    />
  );
}

/** Centered empty state inside a ListCard. */
export function ListEmptyState({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        padding: 32,
        textAlign: 'center',
        color: 'var(--ui-text-3)',
        fontSize: 13,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
