import type { CSSProperties, ReactNode } from 'react';
import type { Tone } from '../internal/tone';

export type KVGridLayout = 'stack' | 'inline';

export interface KVGridItem {
  /** Key: above the value in `stack`, before it in `inline`. */
  label: string;
  /** Rendered as-is; `undefined` or `null` falls back to `emptyValue`. */
  value?: ReactNode;
  /** Monospace value — hashes, ids, paths. */
  mono?: boolean;
  /** Value colour; `neutral` keeps the default text colour. */
  tone?: Tone;
  /** Native tooltip for a value that is hard to read in place. */
  title?: string;
  /** Stable key; the index is used when omitted. */
  key?: string | number;
}

export interface KVGridProps {
  items: KVGridItem[];
  /** `stack` puts the key above the value, `inline` puts both on one row. */
  layout?: KVGridLayout;
  /** Columns of key/value pairs. Long values wrap instead of widening a column. */
  columns?: 1 | 2 | 3;
  /** Horizontal alignment of an inline value; `start` is the default. */
  valueAlign?: 'start' | 'end';
  /** Hairline rule between rows — the settings-list reading of `inline`. */
  divided?: boolean;
  /** Stand-in for a missing value. */
  emptyValue?: string;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

function isMissing(value: ReactNode): boolean {
  return value === undefined || value === null;
}

/**
 * A key/value definition list. `stack` is the detail-sheet reading (small
 * uppercase key above a wrapping value); `inline` is the settings-row reading
 * (key left, value right). Values fall back to an em dash so a row never
 * collapses when the API sends nothing.
 */
export default function KVGrid({
  items,
  layout = 'stack',
  columns = 1,
  valueAlign = 'start',
  divided = false,
  emptyValue = '—',
  ariaLabel,
  className,
  style,
}: KVGridProps) {
  return (
    <dl
      className={[
        'ui-kv-grid',
        `ui-kv-grid--cols-${columns}`,
        `ui-kv-grid--${layout}`,
        valueAlign === 'end' ? 'ui-kv-grid--align-end' : '',
        divided ? 'ui-kv-grid--divided' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaLabel}
      style={style}
    >
      {items.map((item, index) => (
        <div className="ui-kv-grid-row" key={item.key ?? index}>
          <dt className="ui-kv-grid-key">{item.label}</dt>
          <dd
            className={[
              'ui-kv-grid-value',
              isMissing(item.value) ? 'ui-kv-grid-value--empty' : '',
              item.mono ? 'ui-kv-grid-value--mono' : '',
              item.tone && item.tone !== 'neutral' ? `ui-kv-grid-value--${item.tone}` : '',
            ]
              .filter(Boolean)
              .join(' ')}
            title={item.title}
          >
            {isMissing(item.value) ? emptyValue : item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
