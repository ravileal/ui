import type { CSSProperties } from 'react';
import type { Tone } from '../internal/tone';

/** A point in time: an ISO 8601 string, a `Date` or epoch milliseconds. */
export type TimelineAt = string | number | Date;

export interface TimelineItem {
  /** Stable key for the row; the label is used when omitted. */
  id?: string;
  /** Hop name, shown next to the source tag. */
  label: string;
  /** Short origin tag: `proxy`, `hub`, `delivery`. */
  source?: string;
  /** Absolute start. Ignored when `offset` is set. */
  start?: TimelineAt;
  /** Offset from the window start, in ms. Wins over `start`. */
  offset?: number;
  /** Duration in ms. Omit (or pass `null`) for a hop with no measurable span. */
  ms?: number | null;
  /** Muted sub-line: who → to, plus any detail. */
  detail?: string;
  tone?: Tone;
  /** Marks the hop as failed: the row, its bar and its numbers turn red. */
  bad?: boolean;
}

export interface TimelineProps {
  items: TimelineItem[];
  /**
   * Fixed track width in ms. Omit to fit the data. A window narrower than the
   * data clamps the rows at the right edge instead of letting them overflow.
   */
  windowMs?: number;
  emptyLabel?: string;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

export interface TimelineBarProps {
  /** Left edge as a percentage of the track (0–100). */
  offsetPct: number;
  /** Bar width as a percentage of the track (0–100). */
  widthPct: number;
  tone?: Tone;
  className?: string;
  style?: CSSProperties;
}

export interface TimelineRowProps {
  label: string;
  source?: string;
  detail?: string;
  /** Offset from the window start, in ms. */
  offsetMs: number;
  /** Duration in ms; `null` draws a marker at the offset instead of a bar. */
  ms?: number | null;
  /** Span of the track in ms. */
  windowMs: number;
  tone?: Tone;
  bad?: boolean;
  className?: string;
  style?: CSSProperties;
}

function clampPct(value: number): number {
  const safe = Number.isFinite(value) ? value : 0;
  return Math.min(100, Math.max(0, safe));
}

function formatMs(value: number): string {
  return `${Math.round(value)} ms`;
}

/** `+40 ms · 120 ms`: the offset first, the duration only when there is one. */
function formatTiming(offsetMs: number, ms: number | null): string {
  const offset = `+${formatMs(offsetMs)}`;
  return ms == null ? offset : `${offset} · ${formatMs(ms)}`;
}

function toEpoch(value: TimelineAt): number | null {
  const ms =
    value instanceof Date ? value.getTime() : typeof value === 'number' ? value : Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}

interface ResolvedItem {
  key: string;
  label: string;
  source?: string;
  detail?: string;
  tone?: Tone;
  bad: boolean;
  offsetMs: number;
  ms: number | null;
}

function resolveItem(item: TimelineItem, index: number): ResolvedItem {
  const startMs = item.start === undefined ? null : toEpoch(item.start);
  const offsetMs = item.offset ?? startMs ?? 0;

  return {
    key: item.id ?? `${index}-${item.label}`,
    label: item.label,
    source: item.source,
    detail: item.detail,
    tone: item.tone,
    bad: item.bad ?? false,
    offsetMs: Number.isFinite(offsetMs) ? offsetMs : 0,
    ms: item.ms === undefined ? null : item.ms,
  };
}

/** The window starts at the earliest row and spans the data, or `windowMs`. */
function resolveWindow(
  rows: ResolvedItem[],
  windowMs?: number,
): { originMs: number; spanMs: number } {
  const originMs = rows.length ? Math.min(...rows.map((row) => row.offsetMs)) : 0;
  const explicit = windowMs != null && windowMs > 0 ? windowMs : null;
  if (explicit != null) return { originMs, spanMs: explicit };

  const endMs = rows.length ? Math.max(...rows.map((row) => row.offsetMs + (row.ms ?? 0))) : 0;
  const dataSpan = endMs - originMs;
  return { originMs, spanMs: dataSpan > 0 ? dataSpan : 1 };
}

/**
 * One gantt segment: absolutely positioned inside `.ui-timeline-track`. It is
 * decoration — the row's numeric timing text carries the same information.
 */
export function TimelineBar({
  offsetPct,
  widthPct,
  tone = 'accent',
  className,
  style,
}: TimelineBarProps) {
  return (
    <span
      aria-hidden="true"
      className={[
        'ui-timeline-bar',
        tone !== 'accent' ? `ui-timeline-bar--${tone}` : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ left: `${clampPct(offsetPct)}%`, width: `${clampPct(widthPct)}%`, ...style }}
    />
  );
}

/** One hop of the waterfall: source tag, label, numbers, track and detail. */
export function TimelineRow({
  label,
  source,
  detail,
  offsetMs,
  ms = null,
  windowMs,
  tone = 'accent',
  bad = false,
  className,
  style,
}: TimelineRowProps) {
  const spanMs = Number.isFinite(windowMs) && windowMs > 0 ? windowMs : 1;
  const leftPct = clampPct((offsetMs / spanMs) * 100);
  const widthPct = ms == null ? 0 : Math.min(clampPct((ms / spanMs) * 100), 100 - leftPct);
  const rowTone: Tone = bad ? 'danger' : tone;

  return (
    <div
      className={[
        'ui-timeline-row',
        rowTone !== 'accent' ? `ui-timeline-row--${rowTone}` : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <div className="ui-timeline-head">
        {source && <span className="ui-timeline-source">{source}</span>}
        <span className="ui-timeline-label">{label}</span>
        <span className="ui-timeline-time">{formatTiming(offsetMs, ms)}</span>
      </div>
      <div className="ui-timeline-track">
        {ms == null ? (
          <span aria-hidden="true" className="ui-timeline-marker" style={{ left: `${leftPct}%` }} />
        ) : (
          <TimelineBar offsetPct={leftPct} widthPct={widthPct} tone={rowTone} />
        )}
      </div>
      {detail && <span className="ui-timeline-detail">{detail}</span>}
    </div>
  );
}

/**
 * Waterfall trace: one row per hop, each drawn as a positioned segment of a
 * shared window. `ProgressBar` fills a 0–100% track; this places a segment
 * anywhere in it, which is what a request timeline needs.
 */
export function Timeline({
  items,
  windowMs,
  emptyLabel,
  ariaLabel,
  className,
  style,
}: TimelineProps) {
  const rows = items.map(resolveItem);
  const { originMs, spanMs } = resolveWindow(rows, windowMs);

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={['ui-timeline', className ?? ''].filter(Boolean).join(' ')}
      style={style}
    >
      {rows.length === 0
        ? emptyLabel && <p className="ui-timeline-empty">{emptyLabel}</p>
        : rows.map((row) => (
            <TimelineRow
              key={row.key}
              label={row.label}
              source={row.source}
              detail={row.detail}
              offsetMs={row.offsetMs - originMs}
              ms={row.ms}
              windowMs={spanMs}
              tone={row.tone}
              bad={row.bad}
            />
          ))}
    </div>
  );
}
