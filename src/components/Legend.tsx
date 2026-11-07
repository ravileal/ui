import type { CSSProperties, ReactNode } from 'react';
import StatusDot from './StatusDot';
import type { StatusDotTone } from './StatusDot';

export interface LegendItem {
  label: ReactNode;
  tone?: StatusDotTone;
  /** Tooltip on the item, for labels that had to be shortened. */
  title?: string;
}

export interface LegendProps {
  items: LegendItem[];
  /** Prose under the dots. ReactNode because the sentence often mixes markup. */
  note?: ReactNode;
  orientation?: 'row' | 'column';
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Dot-and-word legend for anything that colours a row or a shape elsewhere on
 * screen. The dot is decorative — the word carries the meaning — so the dots
 * are hidden from assistive tech and only the labels are read.
 */
export default function Legend({
  items,
  note,
  orientation = 'row',
  ariaLabel,
  className,
  style,
}: LegendProps) {
  if (!items.length && !note) return null;

  return (
    <div
      className={['ui-legend', orientation === 'column' ? 'ui-legend--column' : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {items.length > 0 && (
        <ul className="ui-legend-items" aria-label={ariaLabel}>
          {items.map((item, index) => (
            <li className="ui-legend-item" title={item.title} key={index}>
              <StatusDot tone={item.tone ?? 'neutral'} />
              <span className="ui-legend-label">{item.label}</span>
            </li>
          ))}
        </ul>
      )}
      {note && <p className="ui-legend-note">{note}</p>}
    </div>
  );
}
