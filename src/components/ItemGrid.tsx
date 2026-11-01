import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { Card } from './Card';

export type ItemGridLayout = 'grid' | 'list' | 'adaptive';

/** Column footprint of one block in the adaptive layout: 1 (default) or 2. */
export type ItemGridSpan = 1 | 2;

export interface ItemGridProps<T> {
  items: T[];
  /**
   * `grid` = fixed equal columns, `list` = one column, `adaptive` = the grid
   * reads its container for the column count and lets every block keep its own
   * size, packing them without holes.
   */
  layout?: ItemGridLayout;
  /** One Item/Card per cell. */
  renderItem: (item: T, index: number) => ReactNode;
  getKey?: (item: T, index: number) => string | number;
  /** Fixed column count for `layout="grid"`. Omitted = responsive 2→6 ladder. */
  columns?: number;
  /** Minimum column width for `layout="adaptive"`. Ignored otherwise. */
  minColumnWidth?: number;
  /** Upper bound on the adaptive column count (0 = no bound). */
  maxColumns?: number;
  /** Extra columns a block takes in `layout="adaptive"`: 1 or 2. */
  getSpan?: (item: T, index: number) => ItemGridSpan;
  /** Row track the adaptive layout snaps block heights to; smaller packs tighter. */
  rowHeight?: number;
  gap?: number;
  /** Rendered in one full-width cell when there are no items and not loading. */
  empty?: ReactNode;
  /** Replaces the items with `skeletonCount` loading cards. */
  loading?: boolean;
  skeletonCount?: number;
  className?: string;
  style?: CSSProperties;
}

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Rows a block of `height` needs on a track of `rowHeight`, `gap` apart. */
function rowsFor(height: number, gap: number, rowHeight: number): number {
  return Math.max(1, Math.ceil((height + gap) / (rowHeight + gap)));
}

function columnsFor(width: number, gap: number, minColumnWidth: number, maxColumns: number): number {
  const fit = Math.max(1, Math.floor((width + gap) / (minColumnWidth + gap)));
  return maxColumns > 0 ? Math.min(fit, maxColumns) : fit;
}

/**
 * A semantic list that lays its cells out as a fixed grid, a single column or
 * an adaptive grid.
 *
 * In the adaptive layout the container decides how many columns fit and every
 * block keeps its own footprint: `getSpan` gives it one or two columns, and its
 * height is measured and snapped to a fine row track (`rowHeight`), so a tall
 * block takes the rows it needs instead of stretching the whole row. Auto flow
 * is dense, which pulls later blocks up into the holes a two-column block
 * leaves behind — the mosaic stays gapless, like the packing of a gallery.
 */
export function ItemGrid<T>({
  items,
  layout = 'grid',
  renderItem,
  getKey,
  columns,
  minColumnWidth = 200,
  maxColumns = 0,
  getSpan,
  rowHeight = 4,
  gap = 16,
  empty,
  loading = false,
  skeletonCount = 8,
  className,
  style,
}: ItemGridProps<T>) {
  const adaptive = layout === 'adaptive';
  const listRef = useRef<HTMLUListElement | null>(null);
  const cardsRef = useRef(new Map<string, Element>());
  const keyByCard = useRef(new WeakMap<Element, string>());
  const [columnsFit, setColumnsFit] = useState(0);
  const [rowSpans, setRowSpans] = useState<Record<string, number>>({});
  /* Mirrors of the measured state: the effects compare against these instead of
     calling setState with a value React already has, which would still cost an
     extra render pass and re-run every `renderItem`. */
  const columnsRef = useRef(0);
  const spansRef = useRef<Record<string, number>>({});

  const publishColumns = useCallback((value: number) => {
    if (columnsRef.current === value) return;
    columnsRef.current = value;
    setColumnsFit(value);
  }, []);

  const publishSpans = useCallback((next: Record<string, number>) => {
    spansRef.current = next;
    setRowSpans(next);
  }, []);

  const clearSpans = useCallback(() => {
    if (Object.keys(spansRef.current).length === 0) return;
    publishSpans({});
  }, [publishSpans]);

  const cellKeys = useMemo(() => {
    if (loading) return Array.from({ length: skeletonCount }, (_, index) => `skeleton-${index}`);
    return items.map((item, index) => String(getKey ? getKey(item, index) : index));
  }, [items, getKey, loading, skeletonCount]);

  /* The column count comes from the container, not the viewport: the grid may
     sit inside a panel or a drawer that is much narrower than the window. */
  useIsomorphicLayoutEffect(() => {
    if (!adaptive) {
      publishColumns(0);
      clearSpans();
      return;
    }
    const node = listRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;

    const read = () => {
      const width = node.getBoundingClientRect().width;
      if (!width) return;
      publishColumns(columnsFor(width, gap, minColumnWidth, maxColumns));
    };

    const observer = new ResizeObserver(read);
    observer.observe(node);
    read();
    return () => observer.disconnect();
  }, [adaptive, clearSpans, gap, minColumnWidth, maxColumns, publishColumns]);

  /* Block heights are measured on the rendered card, never on the cell: the
     cell is sized by the span, so measuring it would feed the span back into
     itself. The card keeps its natural height in the adaptive layout, which
     breaks that loop. */
  useIsomorphicLayoutEffect(() => {
    if (!adaptive || columnsFit === 0 || cellKeys.length === 0) {
      clearSpans();
      return;
    }
    if (typeof ResizeObserver === 'undefined') return;

    const cards = cellKeys
      .map((key) => cardsRef.current.get(key))
      .filter((el): el is Element => el != null && 'isConnected' in el && Boolean(el.isConnected));
    if (cards.length === 0) return;

    const measure = (elements: Element[]) => {
      const next = { ...spansRef.current };
      let changed = false;
      for (const el of elements) {
        const key = keyByCard.current.get(el);
        if (key === undefined) continue;
        const rows = rowsFor(el.getBoundingClientRect().height, gap, rowHeight);
        if (next[key] !== rows) {
          next[key] = rows;
          changed = true;
        }
      }
      if (changed) publishSpans(next);
    };

    measure(cards);
    const observer = new ResizeObserver((entries) => measure(entries.map((entry) => entry.target)));
    cards.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [adaptive, cellKeys, clearSpans, columnsFit, gap, publishSpans, rowHeight]);

  /* The measured node is the card inside the cell, never the cell itself: the
     cell is sized by the span, so measuring it would close the loop. */
  const registerCard = useCallback(
    (key: string) => (cell: Element | null) => {
      const card = cell?.firstElementChild;
      if (!card) return;
      cardsRef.current.set(key, card);
      keyByCard.current.set(card, key);
    },
    [],
  );

  const cellStyle = (index: number, requested: ItemGridSpan): CSSProperties => {
    const rows = rowSpans[cellKeys[index]];
    return {
      '--ui-item-cell-cols': adaptive ? Math.min(requested, Math.max(columnsFit, 1)) : 1,
      ...(rows ? { '--ui-item-cell-rows': rows } : null),
    } as CSSProperties;
  };

  /* The row track only engages once every block has a measured span; until
     then the grid keeps plain rows, so nothing collapses to a bare track. */
  const masonry =
    adaptive &&
    columnsFit > 0 &&
    cellKeys.length > 0 &&
    cellKeys.every((key) => rowSpans[key] != null) &&
    !(items.length === 0 && !loading);

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
    cells = items.map((item, index) => {
      const key = cellKeys[index];
      const requested = adaptive && getSpan ? getSpan(item, index) : 1;
      return (
        <li
          key={key}
          ref={registerCard(key)}
          className="ui-item-grid-cell"
          data-cell-key={key}
          style={cellStyle(index, requested === 2 ? 2 : 1)}
        >
          {renderItem(item, index)}
        </li>
      );
    });
  }

  const gridStyle = {
    '--ui-item-grid-gap': `${gap}px`,
    ...(layout === 'grid' && columns != null ? { '--ui-item-grid-cols': columns } : {}),
    ...(adaptive
      ? {
          '--ui-item-grid-min': `${minColumnWidth}px`,
          '--ui-item-grid-row-h': `${rowHeight}px`,
          ...(columnsFit > 0 ? { '--ui-item-grid-cols': columnsFit } : {}),
        }
      : {}),
    ...style,
  } as CSSProperties;

  return (
    <ul
      ref={listRef}
      className={['ui-item-grid', `ui-item-grid--${layout}`, className ?? '']
        .filter(Boolean)
        .join(' ')}
      style={gridStyle}
      data-cols={
        adaptive && columnsFit > 0
          ? columnsFit
          : layout === 'grid' && columns != null
            ? columns
            : undefined
      }
      data-masonry={masonry ? 'true' : undefined}
    >
      {cells}
    </ul>
  );
}

export default ItemGrid;
