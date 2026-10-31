import type { CSSProperties, ReactNode } from 'react';

export type MetaListTone = 'default' | 'muted' | 'danger';

export interface MetaListItem {
  label?: string;
  value: ReactNode;
  mono?: boolean;
  title?: string;
  tone?: MetaListTone;
}

export interface MetaListProps {
  items: MetaListItem[];
  separator?: boolean;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Compact inline metadata line. The optional separator is a CSS `::before`
 * dot, so the DOM never carries a stray text node between the items.
 */
export default function MetaList({
  items,
  separator = false,
  ariaLabel,
  className,
  style,
}: MetaListProps) {
  return (
    <div
      className={['ui-meta-list', separator ? 'ui-meta-list--separator' : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
      role="list"
      aria-label={ariaLabel}
      style={style}
    >
      {items.map((item, index) => (
        <span className="ui-meta-list-item" role="listitem" title={item.title} key={index}>
          {item.label && <span className="ui-meta-list-label">{item.label}</span>}
          <span
            className={[
              'ui-meta-list-value',
              item.mono ? 'ui-meta-list-value--mono' : '',
              item.tone && item.tone !== 'default' ? `ui-meta-list-value--${item.tone}` : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {item.value}
          </span>
        </span>
      ))}
    </div>
  );
}
