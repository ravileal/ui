import type { CSSProperties, ReactNode } from 'react';
import ProgressBar, { type ProgressTone } from './ProgressBar';

export type ProgressStatus = 'pending' | 'running' | 'done' | 'error';

export interface ProgressStatusItem {
  id: string;
  label: ReactNode;
  status: ProgressStatus;
  /** Text shown on the right (current step, result or error). */
  detail?: ReactNode;
}

export interface ProgressStatusPanelProps {
  title: ReactNode;
  /** Current progress in percent. Omit for an indeterminate bar. */
  percent?: number;
  items?: ProgressStatusItem[];
  tone?: ProgressTone;
  progressLabel?: string;
  statusLabels?: Partial<Record<ProgressStatus, ReactNode>>;
  className?: string;
  style?: CSSProperties;
}

const GLYPHS: Record<ProgressStatus, string> = {
  pending: '○',
  running: '…',
  done: '✓',
  error: '⚠',
};

const DEFAULT_LABELS: Record<ProgressStatus, string> = {
  pending: 'Pending',
  running: 'Working…',
  done: 'Done',
  error: 'Failed',
};

/**
 * Async job summary: a heading, a percentage and one progress bar shared by the
 * whole job, plus a compact status line per item (source, file, step…). The
 * caller owns the job semantics and maps its state into `items`.
 */
export default function ProgressStatusPanel({
  title,
  percent,
  items = [],
  tone = 'accent',
  progressLabel = 'Progress',
  statusLabels,
  className,
  style,
}: ProgressStatusPanelProps) {
  const clampedPercent = percent == null ? undefined : Math.min(100, Math.max(0, percent));
  const indeterminate = clampedPercent == null;
  const displayPercent = clampedPercent == null ? '' : `${Math.round(clampedPercent)}%`;

  return (
    <div
      className={['ui-progress-status', className ?? ''].filter(Boolean).join(' ')}
      style={style}
    >
      <div className="ui-progress-status-head">
        <span
          className={['ui-progress-status-title', tone === 'danger' ? 'is-error' : '']
            .filter(Boolean)
            .join(' ')}
        >
          {title}
        </span>
        <span
          className={['ui-progress-status-percent', tone === 'danger' ? 'is-error' : '']
            .filter(Boolean)
            .join(' ')}
        >
          {displayPercent}
        </span>
      </div>

      <ProgressBar
        value={clampedPercent}
        label={progressLabel}
        valueText={indeterminate ? undefined : `${displayPercent} — ${progressLabel}`}
        size="sm"
        tone={tone}
      />

      {items.length > 0 && (
        <div className="ui-progress-status-items">
          {items.map((item) => (
            <div key={item.id} className="ui-progress-status-item" data-status={item.status}>
              <span className="ui-progress-status-glyph" aria-hidden="true">
                {GLYPHS[item.status]}
              </span>
              <span className="ui-progress-status-label">{item.label}</span>
              <span
                className={['ui-progress-status-detail', item.status === 'error' ? 'is-error' : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                {item.detail ?? statusLabels?.[item.status] ?? DEFAULT_LABELS[item.status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
