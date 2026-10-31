import type { CSSProperties, ReactNode } from 'react';
import { Card } from './Card';

export type ItemGridLayout = 'grid' | 'list' | 'adaptive';

export interface ItemGridProps<T> {
  items: T[];
  /** `grid` = fixed equal columns, `list` = one column, `adaptive` = as many as fit. */
  layout?: ItemGridLayout;
  /** One Item/Card per cell. The grid guarantees it fills the cell (100% width and height). */
  renderItem: (item: T, index: number) => ReactNode;
  getKey?: (item: T, index: number) => string | number;
  /** Fixed column count for `layout="grid"`. Ignored by `list` and `adaptive`. */
  columns?: number;
  /** Minimum column width for `layout="adaptive"`. Ignored otherwise. */
  minColumnWidth?: number;
  gap?: number;
  /** Rendered in one full-width cell when there are no items and not loading. */
  empty?: ReactNode;
  /** Replaces the items with `skeletonCount` loading cards. */
  loading?: boolean;
  skeletonCount?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * A semantic list that lays its cells out as a fixed grid, a single column or
 * an adaptive grid. The cell is the sizing contract: the rendered card always
 * fills it in both axes, so no card can overflow its column.
 */
export function ItemGrid<T>({
  items,
  layout = 'grid',
  renderItem,
  getKey,
  columns = 4,
  minColumnWidth = 200,
  gap = 16,
  empty,
  loading = false,
  skeletonCount = 8,
  className,
  style,
}: ItemGridProps<T>) {
  const gridStyle = {
    '--ui-item-grid-gap': `${gap}px`,
    ...(layout === 'grid' ? { '--ui-item-grid-cols': columns } : {}),
    ...(layout === 'adaptive' ? { '--ui-item-grid-min': `${minColumnWidth}px` } : {}),
    ...style,
  } as CSSProperties;

  let cells: ReactNode;
  if (loading) {
    cells = Array.from({ length: skeletonCount }, (_, index) => (
      <li key={`skeleton-${index}`} className="ui-item-grid-cell" aria-hidden="true">
        <Card loading className="ui-item-grid-skeleton">
          {null}
        </Card>
      </li>
    ));
  } else if (items.length === 0) {
    cells =
      empty == null ? null : (
        <li className="ui-item-grid-cell ui-item-grid-cell--empty">{empty}</li>
      );
  } else {
    cells = items.map((item, index) => (
      <li key={getKey ? getKey(item, index) : index} className="ui-item-grid-cell">
        {renderItem(item, index)}
      </li>
    ));
  }

  return (
    <ul
      className={['ui-item-grid', `ui-item-grid--${layout}`, className ?? '']
        .filter(Boolean)
        .join(' ')}
      style={gridStyle}
    >
      {cells}
    </ul>
  );
}

export default ItemGrid;
