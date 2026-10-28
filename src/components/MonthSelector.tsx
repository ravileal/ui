import Dropdown from './Dropdown';
import type { CSSProperties } from 'react';

export interface MonthOption {
  value: string;
  label: string;
}

export interface MonthSelectorProps {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  /** Months in display order (newest first). */
  options: MonthOption[];
  /** Optional entry rendered before the months (e.g. All Months). */
  allOption?: MonthOption;
  ariaLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Month stepper: `‹ May 2026 ›`. The arrows move through the supplied month
 * list (newest first) and are disabled at the bounds. The label becomes a
 * dropdown trigger, so a month can also be picked by clicking it.
 */
export default function MonthSelector({
  selectedMonth,
  setSelectedMonth,
  options,
  allOption,
  ariaLabel = 'Select month',
  previousLabel = 'Previous month',
  nextLabel = 'Next month',
  className,
  style,
}: MonthSelectorProps) {
  const months = options;
  const idx = months.findIndex((month) => month.value === selectedMonth);
  const canGoOlder = idx >= 0 && idx < months.length - 1;
  const canGoNewer = idx > 0;

  return (
    <div className={`ui-month-selector${className ? ` ${className}` : ''}`} style={style}>
      <button
        type="button"
        className="ui-month-selector-arrow"
        aria-label={previousLabel}
        disabled={!canGoOlder}
        onClick={() => {
          if (canGoOlder) setSelectedMonth(months[idx + 1]!.value);
        }}
      >
        ‹
      </button>
      <div className="ui-month-selector-middle">
        <Dropdown
          ariaLabel={ariaLabel}
          value={selectedMonth}
          onChange={setSelectedMonth}
          options={allOption ? [allOption, ...months] : months}
          fullWidth={false}
        />
      </div>
      <button
        type="button"
        className="ui-month-selector-arrow"
        aria-label={nextLabel}
        disabled={!canGoNewer}
        onClick={() => {
          if (canGoNewer) setSelectedMonth(months[idx - 1]!.value);
        }}
      >
        ›
      </button>
    </div>
  );
}
