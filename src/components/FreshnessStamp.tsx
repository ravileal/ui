/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

/* `formatDuration` and `formatRelative` are exported next to the component on
   purpose: the stamp exists so that no app writes its own relative formatter
   again, and a helper nobody can import is a helper that gets copied. */

/** Anything a caller can hand over as an instant: ISO string, epoch ms or `Date`. */
export type FreshnessStampTime = string | number | Date;

export interface FreshnessStampLabels {
  /** Prefix of the first line. Defaults to `updated`. */
  updated?: string;
  /** Prefix of the second line. Defaults to `up`. */
  up?: string;
  /** Shown in place of the relative time while `updatedAt` is `null`. Defaults to `loading…`. */
  loading?: string;
}

export interface FreshnessStampProps {
  /** When the data was last read. `null`/`undefined` renders the loading label. */
  updatedAt?: FreshnessStampTime | null;
  /** When the process or service started. Omitted, the second line disappears. */
  startedAt?: FreshnessStampTime | null;
  /**
   * Freezes the clock at this instant (epoch ms) and turns the timer off. Use it
   * for deterministic snapshots; omit it and the stamp re-reads `Date.now()`
   * every `refreshInterval` ms.
   */
  now?: number;
  /** Tick period in ms. Defaults to `1000`; `0` keeps the stamp static. */
  refreshInterval?: number;
  labels?: FreshnessStampLabels;
  className?: string;
  style?: CSSProperties;
}

const SECOND = 1000;
const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const DEFAULT_LABELS: Required<FreshnessStampLabels> = {
  updated: 'updated',
  up: 'up',
  loading: 'loading…',
};

const DEFAULT_REFRESH_INTERVAL = SECOND;

/** Shown when the caller passed something the clock cannot read. */
const UNREADABLE = '—';

function toEpoch(value: unknown): number | null {
  if (value == null) return null;
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isFinite(time) ? time : null;
  }
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : time;
}

/**
 * Compact duration: the two most significant units, never a zero tail.
 * `0s`, `45s`, `3h 12m`, `2d 4h`.
 */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '0s';
  const total = Math.floor(ms / SECOND);
  const days = Math.floor(total / DAY);
  const hours = Math.floor((total % DAY) / HOUR);
  const minutes = Math.floor((total % HOUR) / MINUTE);
  const seconds = total % 60;

  if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  if (minutes > 0) return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  return `${seconds}s`;
}

/**
 * How long ago `at` was, as one short phrase: `3s ago`, `1m 30s ago`,
 * `2h 30m ago`, `2d ago`. A future or under-a-second instant reads
 * `just now`; an unreadable input reads `—`.
 */
export function formatRelative(
  at: FreshnessStampTime | null | undefined,
  now = Date.now(),
): string {
  const epoch = toEpoch(at);
  if (epoch === null) return UNREADABLE;
  const elapsed = now - epoch;
  if (elapsed < SECOND) return 'just now';
  return `${formatDuration(elapsed)} ago`;
}

/**
 * The two-line freshness stamp that sits in a header: how old the data is on
 * top, how long the process has been up underneath.
 *
 * The numbers come from `formatRelative` and `formatDuration`, exported with the
 * component so an app never grows its own copy of either. Both lines are
 * decoration for a reader who is already looking at the data, so the stamp
 * carries no live region: a value that changes every second would otherwise
 * interrupt a screen reader on every tick.
 */
export default function FreshnessStamp({
  updatedAt,
  startedAt,
  now,
  refreshInterval = DEFAULT_REFRESH_INTERVAL,
  labels,
  className,
  style,
}: FreshnessStampProps) {
  const frozen = typeof now === 'number' && Number.isFinite(now);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (frozen || refreshInterval <= 0) return;
    const timer = setInterval(() => setTick((tick) => tick + 1), refreshInterval);
    return () => clearInterval(timer);
  }, [frozen, refreshInterval]);

  const clock = frozen ? now : Date.now();
  const text = { ...DEFAULT_LABELS, ...labels };

  const updatedEpoch = toEpoch(updatedAt);
  const startedEpoch = toEpoch(startedAt);
  // `updatedAt` missing and `updatedAt` unreadable are different states: the
  // first is "we have not read yet", the second is a caller bug worth showing.
  const pending = updatedAt == null;

  return (
    <div className={['ui-freshness', className ?? ''].filter(Boolean).join(' ')} style={style}>
      <span className="ui-freshness-line ui-freshness-line--updated">
        <span className="ui-freshness-label">{text.updated}</span>
        {pending ? (
          <span className="ui-freshness-value ui-freshness-value--loading">{text.loading}</span>
        ) : (
          <time
            className="ui-freshness-value"
            dateTime={updatedEpoch === null ? undefined : new Date(updatedEpoch).toISOString()}
          >
            {formatRelative(updatedEpoch, clock)}
          </time>
        )}
      </span>
      {startedAt != null && (
        <span className="ui-freshness-line ui-freshness-line--uptime">
          <span className="ui-freshness-label">{text.up}</span>
          <span className="ui-freshness-value ui-freshness-value--duration">
            {startedEpoch === null ? UNREADABLE : formatDuration(clock - startedEpoch)}
          </span>
        </span>
      )}
    </div>
  );
}
