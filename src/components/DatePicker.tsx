import {
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { usePopover } from '../internal/usePopover';

function parseISO(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? '');
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function toISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface DatePickerProps {
  /** ISO date (`YYYY-MM-DD`) or empty string. */
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  /** Trigger label style: `friendly` = "Mar 30, 2026", `short` = "03/30/2026". */
  format?: 'friendly' | 'short';
  /** `sm` for compact table cells, `md` for form fields (matches input height). */
  size?: 'sm' | 'md';
  fontSize?: number;
  /** Extra style for the trigger button (e.g. tighter horizontal padding in a narrow cell). */
  triggerStyle?: CSSProperties;
  /** BCP 47 locale used for formatting month/weekday labels. Defaults to `en-US`. */
  locale?: string;
  /** Overrides the narrow weekday labels. The list starts on Sunday. */
  weekdayLabels?: string[];
  previousMonthLabel?: string;
  nextMonthLabel?: string;
  clearLabel?: string;
  todayLabel?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Themed calendar trigger. The month grid is portaled and follows the shared
 * popover behavior (flip/reposition/outside-click/Escape) so it is never clipped
 * and matches the design system instead of the native OS date picker.
 */
export default function DatePicker({
  value,
  onChange,
  ariaLabel = 'Date',
  placeholder = 'Select date',
  disabled = false,
  invalid = false,
  format = 'friendly',
  size = 'sm',
  fontSize = 13,
  triggerStyle,
  locale = 'en-US',
  weekdayLabels,
  previousMonthLabel = 'Previous month',
  nextMonthLabel = 'Next month',
  clearLabel = 'Clear',
  todayLabel = 'Today',
  className,
  style,
}: DatePickerProps) {
  const selected = parseISO(value);
  const [view, setView] = useState(() => {
    const base = selected ?? new Date();
    return { year: base.getFullYear(), month: base.getMonth() };
  });
  const { open, pos, triggerRef, menuRef, openMenu, closeMenu } = usePopover({
    maxHeight: 360,
    minWidth: 264,
    fitContent: true,
  });

  const defaultWeekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
    return Array.from({ length: 7 }, (_, index) => formatter.format(new Date(2024, 0, 7 + index)));
  }, [locale]);

  const weekdays = weekdayLabels ?? defaultWeekdayLabels;
  const monthTitle = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
        new Date(view.year, view.month, 1),
      ),
    [locale, view.month, view.year],
  );

  const showCalendar = () => {
    if (disabled) return;
    const base = parseISO(value) ?? new Date();
    setView({ year: base.getFullYear(), month: base.getMonth() });
    openMenu();
  };

  const shiftMonth = (delta: number) =>
    setView((current) => {
      const next = new Date(current.year, current.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });

  const firstOfMonth = new Date(view.year, view.month, 1);
  const gridStart = new Date(view.year, view.month, 1 - firstOfMonth.getDay());
  const cells = Array.from(
    { length: 42 },
    (_, index) =>
      new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index),
  );

  const todayISO = toISO(new Date());
  const label = selected
    ? format === 'short'
      ? selected.toLocaleDateString(locale, {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        })
      : selected.toLocaleDateString(locale, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
    : '';

  const onTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) closeMenu(true);
      else showCalendar();
    }
  };

  const pick = (iso: string) => {
    onChange(iso);
    closeMenu(true);
  };

  return (
    <div className={`ui-dropdown${className ? ` ${className}` : ''}`} style={style}>
      <button
        ref={triggerRef}
        type="button"
        className={
          'ui-dropdown-trigger' + (size === 'md' ? ' is-md' : '') + (invalid ? ' is-invalid' : '')
        }
        style={triggerStyle}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => (open ? closeMenu() : showCalendar())}
        onKeyDown={onTriggerKeyDown}
      >
        <span
          className="ui-dropdown-value"
          style={{ fontSize, color: label ? 'var(--ui-text)' : 'var(--ui-text-3)' }}
        >
          {label || placeholder}
        </span>
        <svg
          className="ui-datepicker-icon"
          width="13"
          height="13"
          viewBox="0 0 13 13"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          aria-hidden="true"
        >
          <rect x="1.5" y="2.5" width="10" height="9" rx="1.5" />
          <line x1="1.5" y1="5.5" x2="11.5" y2="5.5" />
          <line x1="4.5" y1="1" x2="4.5" y2="3.5" />
          <line x1="8.5" y1="1" x2="8.5" y2="3.5" />
        </svg>
      </button>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            className="ui-datepicker-menu"
            role="dialog"
            aria-label={ariaLabel}
            style={{ left: pos.left, top: pos.top, bottom: pos.bottom, width: pos.width }}
          >
            <div className="ui-datepicker-head">
              <span className="ui-datepicker-title">{monthTitle}</span>
              <span className="ui-datepicker-nav">
                <button
                  type="button"
                  aria-label={previousMonthLabel}
                  onClick={() => shiftMonth(-1)}
                >
                  ‹
                </button>
                <button type="button" aria-label={nextMonthLabel} onClick={() => shiftMonth(1)}>
                  ›
                </button>
              </span>
            </div>
            <div className="ui-datepicker-grid">
              {weekdays.map((weekday, index) => (
                <span key={`${weekday}-${index}`} className="ui-datepicker-wd">
                  {weekday}
                </span>
              ))}
              {cells.map((cell) => {
                const iso = toISO(cell);
                const isOutside = cell.getMonth() !== view.month;
                const isSelected = !!selected && toISO(selected) === iso;
                const isToday = todayISO === iso;
                return (
                  <button
                    key={iso}
                    type="button"
                    className={
                      'ui-datepicker-day' +
                      (isOutside ? ' is-out' : '') +
                      (isToday ? ' is-today' : '') +
                      (isSelected ? ' is-selected' : '')
                    }
                    aria-current={isToday ? 'date' : undefined}
                    onClick={() => pick(iso)}
                  >
                    {cell.getDate()}
                  </button>
                );
              })}
            </div>
            <div className="ui-datepicker-foot">
              <button type="button" onClick={() => pick('')}>
                {clearLabel}
              </button>
              <button type="button" onClick={() => pick(todayISO)}>
                {todayLabel}
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
