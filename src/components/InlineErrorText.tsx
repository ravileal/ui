import type { CSSProperties, ReactNode } from 'react';

export interface InlineErrorTextProps {
  children: ReactNode;
  /** Renders the trailing action when provided. */
  onRetry?: () => void;
  retryLabel?: string;
  /** Stretch to the width of the parent instead of hugging the content. */
  block?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * One-line failure label. The message truncates instead of wrapping, so it
 * never pushes the row it belongs to, and the retry action sits on the same
 * baseline. Alert is the panel for the same news; this is the line under a row.
 */
export default function InlineErrorText({
  children,
  onRetry,
  retryLabel = 'Retry',
  block = false,
  className,
  style,
}: InlineErrorTextProps) {
  return (
    <span
      role="alert"
      aria-live="assertive"
      className={['ui-inline-error', block ? 'ui-inline-error--block' : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <span className="ui-inline-error-text">{children}</span>
      {onRetry && (
        <button type="button" className="ui-inline-error-retry" onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </span>
  );
}
