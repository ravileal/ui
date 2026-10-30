import type { CSSProperties } from 'react';

export type ProgressTone = 'accent' | 'success' | 'warning' | 'danger';

export interface ProgressBarProps {
  /** Current value. Omit/undefined for an indeterminate bar. */
  value?: number;
  max?: number;
  label?: string;
  /** Overrides the computed percentage (e.g. "3 of 8 files"). */
  valueText?: string;
  size?: 'sm' | 'md';
  tone?: ProgressTone;
  className?: string;
  style?: CSSProperties;
}

export default function ProgressBar({
  value,
  max = 100,
  label = 'Progress',
  valueText,
  size = 'md',
  tone = 'accent',
  className,
  style,
}: ProgressBarProps) {
  const indeterminate = value == null;
  const safeMax = max > 0 ? max : 100;
  const clamped = indeterminate ? 0 : Math.min(safeMax, Math.max(0, value));
  const percent = indeterminate ? 0 : (clamped / safeMax) * 100;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : safeMax}
      aria-valuenow={indeterminate ? undefined : clamped}
      aria-valuetext={valueText}
      className={[
        'ui-progress',
        `ui-progress--${size}`,
        `ui-progress--${tone}`,
        indeterminate ? 'is-indeterminate' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <span
        className="ui-progress-bar"
        style={indeterminate ? undefined : { width: `${percent}%` }}
      />
    </div>
  );
}
