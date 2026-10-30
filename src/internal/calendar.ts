export const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const MAX_DAY_CHIPS = 3;

/** Parses an ISO date (`YYYY-MM-DD`, tolerating a time suffix) into a local Date. */
export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? '');
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Formats a local Date as `YYYY-MM-DD`. */
export function toISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** The 42 cells (6 weeks) of the month grid, starting on the Sunday on/before day 1. */
export function buildMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const start = new Date(year, month, 1 - firstOfMonth.getDay());
  return Array.from(
    { length: 42 },
    (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index),
  );
}

/** `"October 2026"` label for a zero-based month. */
export function monthGridLabel(year: number, month: number): string {
  return `${MONTH_NAMES[month]} ${year}`;
}

/** True when `iso` falls inside `[start, end]` (both bounds inclusive). */
export function isWithinRange(iso: string, start: string, end: string): boolean {
  if (!iso || !start || !end) return false;
  return start <= iso && iso <= end;
}

/**
 * Range-selection reducer for the inline picker.
 * - no start: begin a new single-day range on `iso`;
 * - single-day start (start === end): extend to `iso` when it is not before the
 *   start, otherwise restart on `iso`;
 * - complete range: restart on `iso`.
 */
export function nextRangeSelection(
  iso: string,
  start: string,
  end: string,
): { startDate: string; endDate: string } {
  if (!start) return { startDate: iso, endDate: iso };
  if (start === end) {
    return iso < start ? { startDate: iso, endDate: iso } : { startDate: start, endDate: iso };
  }
  return { startDate: iso, endDate: iso };
}

const PALETTE = [
  '#4f7cff',
  '#00c9a7',
  '#f59e0b',
  '#f472b6',
  '#a78bfa',
  '#34d399',
  '#fb923c',
  '#22d3ee',
] as const;

function hashCode(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

function hexToRgba(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Deterministic chip colors derived from the event id. */
export function eventColor(id: string): { chipBg: string; chipBorder: string } {
  const hex = PALETTE[hashCode(id) % PALETTE.length];
  return { chipBg: hexToRgba(hex, 0.16), chipBorder: hex };
}

export interface CalendarEventLike {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

/** Every event covering the date, ordered by start date (then name). */
export function eventsCoveringDate<T extends CalendarEventLike>(events: T[], date: string): T[] {
  return events
    .filter((event) => event.startDate <= date && date <= event.endDate)
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.name.localeCompare(b.name));
}
