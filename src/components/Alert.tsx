import type { CSSProperties, ReactNode } from 'react';
import type { Tone } from '../internal/tone';

export interface AlertProps {
  children: ReactNode;
  tone?: Exclude<Tone, 'accent' | 'purple'>;
  title?: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
  role?: 'alert' | 'status';
  className?: string;
  style?: CSSProperties;
}

export default function Alert({
  children,
  tone = 'info',
  title,
  action,
  onDismiss,
  dismissLabel = 'Dismiss',
  role,
  className,
  style,
}: AlertProps) {
  const resolvedRole = role ?? (tone === 'danger' || tone === 'warning' ? 'alert' : 'status');

  return (
    <div
      role={resolvedRole}
      aria-live={resolvedRole === 'alert' ? 'assertive' : 'polite'}
      className={['ui-alert', `ui-alert--${tone}`, className ?? ''].filter(Boolean).join(' ')}
      style={style}
    >
      <div className="ui-alert-content">
        {title && <div className="ui-alert-title">{title}</div>}
        <div className="ui-alert-body">{children}</div>
      </div>
      {(action || onDismiss) && (
        <div className="ui-alert-actions">
          {action}
          {onDismiss && (
            <button
              type="button"
              className="ui-alert-dismiss"
              aria-label={dismissLabel}
              onClick={onDismiss}
            >
              ×
            </button>
          )}
        </div>
      )}
    </div>
  );
}
