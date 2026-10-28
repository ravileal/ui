import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { copyToClipboard } from '../internal/clipboard';
import Tooltip from './Tooltip';

export interface CopyValueLabels {
  copied?: string;
  clickToCopy?: string;
  tooltip?: string;
}

export interface CopyValueProps {
  /** Raw value copied to the clipboard. */
  value: number | string;
  /** Visible content; defaults to `formatValue(value)`. */
  children?: ReactNode;
  /** Accessible name of the copy affordance. */
  ariaLabel: string;
  /** Formats the visible value. Defaults to `String(value)`. */
  formatValue?: (value: number | string) => ReactNode;
  /** Serializes the value copied to the clipboard. Defaults to `String(value)`. */
  copyValue?: (value: number | string) => string;
  /** Label shown in the tooltip above the copied value. */
  tooltipLabel?: string;
  labels?: CopyValueLabels;
  className?: string;
  style?: CSSProperties;
  /** Style for the tooltip trigger wrapper (e.g. right alignment in a header). */
  wrapperStyle?: CSSProperties;
}

/**
 * Click-to-copy value. The panel is informational only (the click itself
 * copies). Formatting and clipboard serialization are injectable so the
 * component stays independent from an application's currency helpers.
 */
export default function CopyValue({
  value,
  children,
  ariaLabel,
  formatValue = (current) => String(current),
  copyValue = (current) => String(current),
  tooltipLabel,
  labels,
  className,
  style,
  wrapperStyle,
}: CopyValueProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const copy = () => {
    copyToClipboard(copyValue(value)).then((ok) => {
      if (!ok) return;
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Tooltip
      content={
        copied ? (
          <span style={{ color: 'var(--ui-green)', fontWeight: 600 }}>
            {labels?.copied ?? '✓ Copied'}
          </span>
        ) : (
          <>
            <span className="ui-tooltip-label">{tooltipLabel ?? labels?.tooltip ?? 'Amount'}</span>
            {labels?.clickToCopy ?? 'Click to copy'}
          </>
        )
      }
      delay={0}
      style={wrapperStyle}
    >
      <span
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        className={'ui-copy-value' + (className ? ' ' + className : '')}
        onClick={copy}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            copy();
          }
        }}
        style={{
          ...style,
          cursor: copied ? 'default' : 'pointer',
          color: copied ? 'var(--ui-green)' : style?.color,
        }}
      >
        {children ?? formatValue(value)}
      </span>
    </Tooltip>
  );
}
