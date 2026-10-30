import { useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import Tooltip from './Tooltip';
import {
  MAX_DAY_CHIPS,
  WEEKDAY_INITIALS,
  buildMonthGrid,
  eventColor,
  eventsCoveringDate,
  isWithinRange,
  monthGridLabel,
  nextRangeSelection,
  parseISODate,
  toISO,
} from '../internal/calendar';

export interface MonthCalendarEvent {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  /** Overrides the deterministic chip color. */
  color?: string | { background: string; border: string };
}

export interface MonthCalendarLabels {
  previousMonth?: string;
  nextMonth?: string;
  clear?: string;
  selectStart?: string;
}

interface MonthCalendarBaseProps {
  /** `YYYY-MM` month shown on first render (defaults to the current month). */
  initialMonth?: string;
  weekdayLabels?: readonly string[];
  monthLabel?: (year: number, month: number) => ReactNode;
  formatRange?: (startDate: string, endDate: string) => ReactNode;
  labels?: MonthCalendarLabels;
  maxDayChips?: number;
  className?: string;
  style?: CSSProperties;
}

export interface MonthCalendarViewProps extends MonthCalendarBaseProps {
  mode: 'view';
  events: MonthCalendarEvent[];
  onDayClick?: (iso: string) => void;
  /** Opens the clicked event chip instead of creating a new event. */
  onEventClick?: (event: MonthCalendarEvent) => void;
  renderEventTooltip?: (event: MonthCalendarEvent) => ReactNode;
}

export interface MonthCalendarRangeProps extends MonthCalendarBaseProps {
  mode: 'range';
  startDate: string;
  endDate: string;
  onChange: (range: { startDate: string; endDate: string }) => void;
}

export type MonthCalendarProps = MonthCalendarViewProps | MonthCalendarRangeProps;

function initialView(
  initialMonth: string | undefined,
  startDate: string | undefined,
): { year: number; month: number } {
  const fromMonth = initialMonth ? parseISODate(`${initialMonth}-01`) : null;
  const fromStart = startDate ? parseISODate(startDate) : null;
  const base = fromMonth ?? fromStart ?? new Date();
  return { year: base.getFullYear(), month: base.getMonth() };
}

function defaultFormatRange(startDate: string, endDate: string): string {
  if (!startDate) return '';
  if (!endDate || endDate === startDate) return startDate;
  return `${startDate} – ${endDate}`;
}

function chipColors(event: MonthCalendarEvent): { background: string; border: string } {
  if (!event.color) {
    const color = eventColor(event.id);
    return { background: color.chipBg, border: color.chipBorder };
  }
  if (typeof event.color === 'string') {
    return {
      background: `color-mix(in srgb, ${event.color} 16%, transparent)`,
      border: event.color,
    };
  }
  return { background: event.color.background, border: event.color.border };
}

/**
 * Inline month grid with two modes: `view` renders event chips and opens the
 * clicked day/event, while `range` is the start/end picker. All content and
 * formatting are injected by the caller.
 */
export default function MonthCalendar(props: MonthCalendarProps) {
  const startDate = props.mode === 'range' ? props.startDate : '';
  const [view, setView] = useState(() => initialView(props.initialMonth, startDate));

  const shiftMonth = (delta: number) =>
    setView((current) => {
      const next = new Date(current.year, current.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });

  const cells = buildMonthGrid(view.year, view.month);
  const todayISO = toISO(new Date());
  const formatRange = props.formatRange ?? defaultFormatRange;
  const weekdayLabels = props.weekdayLabels ?? WEEKDAY_INITIALS;
  const monthLabel = props.monthLabel ?? monthGridLabel;
  const labels = props.labels ?? {};
  const maxDayChips = props.maxDayChips ?? MAX_DAY_CHIPS;

  function pickDay(iso: string) {
    if (props.mode === 'range') {
      props.onChange(nextRangeSelection(iso, props.startDate, props.endDate));
      return;
    }
    props.onDayClick?.(iso);
  }

  const onDayKeyDown = (event: KeyboardEvent<HTMLDivElement>, iso: string) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      pickDay(iso);
    }
  };

  function renderChips(dayEvents: MonthCalendarEvent[]): ReactNode {
    const shown = dayEvents.slice(0, maxDayChips);
    const overflow = dayEvents.length - shown.length;
    return (
      <div className="ui-month-calendar-chips">
        {shown.map((event) => {
          const color = chipColors(event);
          const tooltip =
            props.mode === 'view' && props.renderEventTooltip ? (
              props.renderEventTooltip(event)
            ) : (
              <div className="ui-month-calendar-tooltip">
                <span className="ui-month-calendar-tooltip-name">{event.name}</span>
                <span className="ui-month-calendar-tooltip-range">
                  {formatRange(event.startDate, event.endDate)}
                </span>
              </div>
            );
          return (
            <Tooltip key={event.id} content={tooltip} maxWidth={220}>
              <button
                type="button"
                className="ui-month-calendar-chip"
                style={{ background: color.background, borderLeftColor: color.border }}
                onClick={(clickEvent) => {
                  clickEvent.stopPropagation();
                  if (props.mode === 'view') props.onEventClick?.(event);
                }}
              >
                {event.name}
              </button>
            </Tooltip>
          );
        })}
        {overflow > 0 && <span className="ui-month-calendar-more">+{overflow} more</span>}
      </div>
    );
  }

  return (
    <div
      className={['ui-month-calendar', props.className ?? ''].filter(Boolean).join(' ')}
      style={props.style}
    >
      <div className="ui-month-calendar-head">
        <span className="ui-month-calendar-title">{monthLabel(view.year, view.month)}</span>
        <span className="ui-month-calendar-nav">
          <button
            type="button"
            aria-label={labels.previousMonth ?? 'Previous month'}
            onClick={() => shiftMonth(-1)}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label={labels.nextMonth ?? 'Next month'}
            onClick={() => shiftMonth(1)}
          >
            ›
          </button>
        </span>
      </div>

      <div className="ui-month-calendar-grid">
        {weekdayLabels.map((weekday, index) => (
          <span key={`${weekday}-${index}`} className="ui-month-calendar-weekday">
            {weekday}
          </span>
        ))}
        {cells.map((cell) => {
          const iso = toISO(cell);
          const isOutside = cell.getMonth() !== view.month;
          const isToday = todayISO === iso;
          const dayEvents = props.mode === 'view' ? eventsCoveringDate(props.events, iso) : [];
          const inRange =
            props.mode === 'range' &&
            isWithinRange(iso, props.startDate, props.endDate || props.startDate);
          const isStart = props.mode === 'range' && props.startDate === iso;
          const isEnd = props.mode === 'range' && props.endDate === iso;

          const cellClass = [
            'ui-month-calendar-cell',
            isOutside ? 'is-out' : '',
            isToday ? 'is-today' : '',
            inRange ? 'is-in-range' : '',
            isStart ? 'is-range-start' : '',
            isEnd ? 'is-range-end' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div key={iso} className="ui-month-calendar-cellwrap">
              <div
                role="button"
                tabIndex={0}
                aria-label={iso}
                className={cellClass}
                onClick={() => pickDay(iso)}
                onKeyDown={(event) => onDayKeyDown(event, iso)}
              >
                <span className="ui-month-calendar-daynum">{cell.getDate()}</span>
                {props.mode === 'view' && dayEvents.length > 0 && renderChips(dayEvents)}
              </div>
            </div>
          );
        })}
      </div>

      {props.mode === 'range' && (
        <div className="ui-month-calendar-foot">
          <span className="ui-month-calendar-range-label">
            {props.startDate
              ? formatRange(props.startDate, props.endDate || props.startDate)
              : (labels.selectStart ?? 'Select a start date')}
          </span>
          <button
            type="button"
            className="ui-month-calendar-clear"
            onClick={() => props.onChange({ startDate: '', endDate: '' })}
          >
            {labels.clear ?? 'Clear'}
          </button>
        </div>
      )}
    </div>
  );
}
