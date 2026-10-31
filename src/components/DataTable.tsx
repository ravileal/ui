import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  /** Text used as the per-cell `data-label` in stacked/card mode. */
  label?: string;
  render?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
  /** Lower bound in px applied while resizing. Defaults to 72. */
  minWidth?: number;
  /** Upper bound in px applied while resizing. */
  maxWidth?: number;
  /** Cannot be hidden or moved from the column menu. */
  fixed?: boolean;
  /** Hidden on first render while the column settings are uncontrolled. */
  defaultHidden?: boolean;
}

export interface DataTableSort {
  key: string;
  direction: 'asc' | 'desc';
}

/** Column order and visibility handled by the column menu. */
export interface DataTableColumnSettings {
  /** Every column key, including hidden ones, in display order. */
  order: string[];
  hidden: string[];
}

export interface DataTableColumnMenuLabels {
  menu: string;
  columns: string;
  reset: string;
  moveLeft: string;
  moveRight: string;
  show: string;
}

export interface DataTablePaginationLabels {
  first: string;
  previous: string;
  next: string;
  last: string;
  rowsPerPage: string;
  pageOf: (page: number, pages: number) => string;
  range: (from: number, to: number, total: number) => string;
}

/**
 * Presentational pagination model: `rows` is already the current page, `total`
 * is the full row count. Nothing is sliced inside the table.
 */
export interface DataTablePagination {
  /** 1-based page number. */
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  labels?: Partial<DataTablePaginationLabels>;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  ariaLabel?: string;
  caption?: ReactNode;
  sort?: DataTableSort;
  onSortChange?: (sort: DataTableSort) => void;
  emptyState?: ReactNode;
  onRowClick?: (row: T) => void;
  /** Adds the `is-stacked` hook so CSS can turn rows into cards on narrow screens. */
  stacked?: boolean;
  /** Drag handles (and keyboard resizing) on every header cell. */
  resizable?: boolean;
  onColumnResize?: (key: string, width: number) => void;
  /** Three-dot menu for hiding and reordering columns. */
  columnMenu?: boolean;
  /** Controlled column settings; takes precedence over the internal state. */
  columnSettings?: DataTableColumnSettings;
  onColumnSettingsChange?: (settings: DataTableColumnSettings) => void;
  columnMenuLabels?: Partial<DataTableColumnMenuLabels>;
  pagination?: DataTablePagination;
  className?: string;
  style?: CSSProperties;
}

const MIN_COLUMN_WIDTH = 72;
const RESIZE_STEP = 16;

const DEFAULT_MENU_LABELS: DataTableColumnMenuLabels = {
  menu: 'Column options',
  columns: 'Columns',
  reset: 'Reset',
  moveLeft: 'Move left',
  moveRight: 'Move right',
  show: 'Show',
};

const DEFAULT_PAGINATION_LABELS: DataTablePaginationLabels = {
  first: 'First page',
  previous: 'Previous page',
  next: 'Next page',
  last: 'Last page',
  rowsPerPage: 'Rows per page',
  pageOf: (page, pages) => `Page ${page} of ${pages}`,
  range: (from, to, total) => `${from}-${to} of ${total}`,
};

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * Column label used for the `data-label` attribute of body cells. Falls back to
 * the header when it is plain text, and to an empty string for node headers.
 */
function cellLabel<T>(column: DataTableColumn<T>): string {
  if (column.label !== undefined) return column.label;
  return typeof column.header === 'string' ? column.header : '';
}

/** Human-readable name for the column menu; always non-empty. */
function columnName<T>(column: DataTableColumn<T>): string {
  if (column.label !== undefined) return column.label;
  if (typeof column.header === 'string') return column.header;
  return column.key;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  ariaLabel,
  caption,
  sort,
  onSortChange,
  emptyState = 'No data',
  onRowClick,
  stacked = true,
  resizable = false,
  onColumnResize,
  columnMenu = false,
  columnSettings,
  onColumnSettingsChange,
  columnMenuLabels,
  pagination,
  className,
  style,
}: DataTableProps<T>) {
  const menuLabels = { ...DEFAULT_MENU_LABELS, ...columnMenuLabels };

  /* --- column order / visibility ----------------------------------------- */
  const columnsByKey = useMemo(
    () => new Map(columns.map((column) => [column.key, column])),
    [columns],
  );

  const [internalSettings, setInternalSettings] = useState<DataTableColumnSettings>(() => ({
    order: columns.map((column) => column.key),
    hidden: columns.filter((column) => column.defaultHidden && !column.fixed).map((c) => c.key),
  }));
  const settings = columnSettings ?? internalSettings;

  /** Drops keys that no longer exist, appends new columns, protects `fixed`. */
  const sanitizeSettings = (next: DataTableColumnSettings): DataTableColumnSettings => {
    const order = next.order.filter((key) => columnsByKey.has(key));
    for (const column of columns) {
      if (!order.includes(column.key)) order.push(column.key);
    }
    const hidden = next.hidden.filter(
      (key) => columnsByKey.has(key) && !columnsByKey.get(key)?.fixed,
    );
    const visible = order.filter((key) => !hidden.includes(key));
    if (visible.length === 0 && order.length > 0) {
      const keeper = order[order.length - 1];
      return { order, hidden: hidden.filter((key) => key !== keeper) };
    }
    return { order, hidden };
  };

  const normalized = useMemo(() => {
    const order: string[] = [];
    for (const key of settings.order) {
      if (columnsByKey.has(key) && !order.includes(key)) order.push(key);
    }
    for (const column of columns) {
      if (!order.includes(column.key)) order.push(column.key);
    }
    const hidden = settings.hidden.filter(
      (key) => columnsByKey.has(key) && !columnsByKey.get(key)?.fixed,
    );
    return { order, hidden };
  }, [settings, columns, columnsByKey]);

  const visibleColumns = normalized.order
    .filter((key) => !normalized.hidden.includes(key))
    .map((key) => columnsByKey.get(key) as DataTableColumn<T>);

  const emitSettings = (next: DataTableColumnSettings) => {
    const cleaned = sanitizeSettings(next);
    if (!columnSettings) setInternalSettings(cleaned);
    onColumnSettingsChange?.(cleaned);
  };

  /* --- resizable columns -------------------------------------------------- */
  const [widths, setWidths] = useState<Record<string, number>>({});
  const headerRefs = useRef<Record<string, HTMLTableCellElement | null>>({});
  const initialWidths = useRef<Record<string, number>>({});
  const dragRef = useRef<{ key: string; startX: number; startWidth: number; width: number } | null>(
    null,
  );
  const [dragKey, setDragKey] = useState<string | null>(null);

  /**
   * Seeds the width state from the measured header cell for columns that ship no
   * numeric `width`. The `widths` dependency plus the "nothing to measure" bail
   * out below keep this from looping; jsdom reports 0 and simply skips.
   */
  useLayoutEffect(() => {
    if (!resizable) return;
    const measured: Record<string, number> = {};
    let changed = false;
    for (const column of columns) {
      if (typeof column.width === 'number') continue;
      if (widths[column.key] !== undefined) continue;
      const width = Math.round(headerRefs.current[column.key]?.getBoundingClientRect().width ?? 0);
      if (width > 0) {
        measured[column.key] = width;
        if (initialWidths.current[column.key] === undefined) {
          initialWidths.current[column.key] = width;
        }
        changed = true;
      }
    }
    if (changed) setWidths((prev) => ({ ...prev, ...measured }));
  }, [columns, resizable, widths]);

  const clampWidth = (value: number, column: DataTableColumn<T>) => {
    const min = column.minWidth ?? MIN_COLUMN_WIDTH;
    const max = column.maxWidth ?? Number.POSITIVE_INFINITY;
    return Math.max(min, Math.min(max, Math.round(value)));
  };

  const widthOf = (column: DataTableColumn<T>) => {
    if (widths[column.key] !== undefined) return widths[column.key];
    return typeof column.width === 'number' ? column.width : undefined;
  };

  /** Measured cell width wins, then the configured width, then the floor. */
  const resolveStartWidth = (column: DataTableColumn<T>) => {
    const measured = Math.round(headerRefs.current[column.key]?.getBoundingClientRect().width ?? 0);
    const configured = typeof column.width === 'number' ? column.width : undefined;
    const start = measured > 0 ? measured : (widthOf(column) ?? configured ?? MIN_COLUMN_WIDTH);
    if (initialWidths.current[column.key] === undefined) {
      initialWidths.current[column.key] = start;
    }
    return start;
  };

  const applyWidth = (key: string, width: number) => {
    setWidths((prev) => (prev[key] === width ? prev : { ...prev, [key]: width }));
  };

  const handleResizeStart = (
    event: ReactPointerEvent<HTMLSpanElement>,
    column: DataTableColumn<T>,
  ) => {
    event.stopPropagation();
    const startWidth = resolveStartWidth(column);
    dragRef.current = { key: column.key, startX: event.clientX, startWidth, width: startWidth };
    setDragKey(column.key);
    const target = event.currentTarget;
    if (typeof target.setPointerCapture === 'function' && Number.isFinite(event.pointerId)) {
      try {
        target.setPointerCapture(event.pointerId);
      } catch {
        /* pointer capture is unavailable (jsdom, older engines) */
      }
    }
  };

  const handleResizeMove = (
    event: ReactPointerEvent<HTMLSpanElement>,
    column: DataTableColumn<T>,
  ) => {
    const drag = dragRef.current;
    if (!drag || drag.key !== column.key) return;
    const width = clampWidth(drag.startWidth + (event.clientX - drag.startX), column);
    drag.width = width;
    applyWidth(drag.key, width);
  };

  const handleResizeEnd = (
    event: ReactPointerEvent<HTMLSpanElement>,
    column: DataTableColumn<T>,
  ) => {
    const drag = dragRef.current;
    if (!drag || drag.key !== column.key) return;
    dragRef.current = null;
    setDragKey(null);
    const target = event.currentTarget;
    if (typeof target.releasePointerCapture === 'function' && Number.isFinite(event.pointerId)) {
      try {
        target.releasePointerCapture(event.pointerId);
      } catch {
        /* pointer capture is unavailable (jsdom, older engines) */
      }
    }
    onColumnResize?.(drag.key, drag.width);
  };

  const handleResizeCancel = () => {
    dragRef.current = null;
    setDragKey(null);
  };

  const handleResizeKey = (
    event: ReactKeyboardEvent<HTMLSpanElement>,
    column: DataTableColumn<T>,
  ) => {
    const handled =
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight' ||
      event.key === 'ArrowUp' ||
      event.key === 'ArrowDown' ||
      event.key === 'Home';
    if (!handled) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') return;

    const current = resolveStartWidth(column);
    let target: number;
    if (event.key === 'Home') {
      target = initialWidths.current[column.key] ?? current;
    } else {
      target = current + (event.key === 'ArrowLeft' ? -RESIZE_STEP : RESIZE_STEP);
    }
    const width = clampWidth(target, column);
    applyWidth(column.key, width);
    onColumnResize?.(column.key, width);
  };

  /* --- column menu -------------------------------------------------------- */
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    const panel = menuRef.current;
    panel?.querySelector<HTMLElement>('input:not(:disabled), button:not(:disabled)')?.focus();

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuTriggerRef.current?.contains(target) || panel?.contains(target)) return;
      setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      menuTriggerRef.current?.focus();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const toggleColumn = (key: string) => {
    const column = columnsByKey.get(key);
    if (!column || column.fixed) return;
    if (normalized.hidden.includes(key)) {
      emitSettings({
        order: normalized.order,
        hidden: normalized.hidden.filter((hiddenKey) => hiddenKey !== key),
      });
      return;
    }
    const visibleCount = normalized.order.length - normalized.hidden.length;
    if (visibleCount <= 1) return;
    emitSettings({ order: normalized.order, hidden: [...normalized.hidden, key] });
  };

  const moveColumn = (key: string, delta: number) => {
    const order = [...normalized.order];
    const from = order.indexOf(key);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= order.length) return;
    [order[from], order[to]] = [order[to], order[from]];
    emitSettings({ order, hidden: normalized.hidden });
  };

  const resetColumns = () => {
    emitSettings({
      order: columns.map((column) => column.key),
      hidden: columns.filter((column) => column.defaultHidden && !column.fixed).map((c) => c.key),
    });
  };

  /* --- pagination --------------------------------------------------------- */
  const pageLabels = { ...DEFAULT_PAGINATION_LABELS, ...pagination?.labels };
  const pageSize = pagination ? Math.max(1, Math.trunc(pagination.pageSize) || 1) : 1;
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pageSize)) : 0;
  const currentPage = pagination
    ? Math.min(Math.max(1, Math.trunc(pagination.page) || 1), totalPages)
    : 0;
  const rangeStart = pagination && pagination.total > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const rangeEnd =
    pagination && pagination.total > 0 ? Math.min(pagination.total, currentPage * pageSize) : 0;
  const goToPage = (page: number) => {
    if (!pagination) return;
    pagination.onPageChange(Math.min(Math.max(1, page), totalPages));
  };

  const emptyColSpan = Math.max(1, visibleColumns.length + (columnMenu ? 1 : 0));

  const tableClassName = ['ui-data-table', resizable ? 'is-resizable' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={[
        'ui-data-table-wrap',
        stacked ? 'is-stacked' : '',
        className ?? '',
        columnMenu ? 'has-menu' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <table className={tableClassName} aria-label={ariaLabel}>
        {caption && <caption>{caption}</caption>}
        {resizable && (
          <colgroup>
            {visibleColumns.map((column) => (
              <col key={column.key} style={{ width: widths[column.key] ?? column.width }} />
            ))}
            {columnMenu && <col className="ui-data-table-menu-col" style={{ width: 40 }} />}
          </colgroup>
        )}
        <thead>
          <tr>
            {visibleColumns.map((column) => {
              const activeSort = sort?.key === column.key ? sort.direction : undefined;
              return (
                <th
                  key={column.key}
                  scope="col"
                  ref={(node) => {
                    headerRefs.current[column.key] = node;
                  }}
                  aria-sort={
                    activeSort === 'asc'
                      ? 'ascending'
                      : activeSort === 'desc'
                        ? 'descending'
                        : column.sortable
                          ? 'none'
                          : undefined
                  }
                  style={{ width: column.width, textAlign: column.align ?? 'left' }}
                >
                  {column.sortable && onSortChange ? (
                    <button
                      type="button"
                      className="ui-data-table-sort"
                      onClick={() =>
                        onSortChange({
                          key: column.key,
                          direction: activeSort === 'asc' ? 'desc' : 'asc',
                        })
                      }
                    >
                      {column.header}
                      {activeSort && (
                        <span className="ui-data-table-sort-icon" aria-hidden="true">
                          {activeSort === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                  {resizable && (
                    <span
                      className={[
                        'ui-data-table-resizer',
                        dragKey === column.key ? 'is-dragging' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      role="separator"
                      aria-orientation="vertical"
                      tabIndex={0}
                      aria-label={`Resize ${cellLabel(column) || column.key} column`}
                      onPointerDown={(event) => handleResizeStart(event, column)}
                      onPointerMove={(event) => handleResizeMove(event, column)}
                      onPointerUp={(event) => handleResizeEnd(event, column)}
                      onPointerCancel={handleResizeCancel}
                      onKeyDown={(event) => handleResizeKey(event, column)}
                      onClick={(event) => event.stopPropagation()}
                    />
                  )}
                </th>
              );
            })}
            {columnMenu && (
              <th className="ui-data-table-menu-cell" scope="col">
                <button
                  type="button"
                  ref={menuTriggerRef}
                  className="ui-data-table-menu-trigger"
                  aria-label={menuLabels.menu}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-controls={menuOpen ? menuId : undefined}
                  data-state={menuOpen ? 'open' : 'closed'}
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  ⋮
                </button>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="ui-data-table-empty" colSpan={emptyColSpan}>
                {emptyState}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={rowKey(row, index)}
                className={onRowClick ? 'is-clickable' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={() => onRowClick?.(row)}
                onKeyDown={(event) => {
                  if (!onRowClick) return;
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onRowClick(row);
                  }
                }}
              >
                {visibleColumns.map((column) => (
                  <td
                    key={column.key}
                    data-label={cellLabel(column)}
                    style={{ textAlign: column.align ?? 'left' }}
                  >
                    {column.render
                      ? column.render(row, index)
                      : String(row[column.key as keyof T] ?? '')}
                  </td>
                ))}
                {columnMenu && <td className="ui-data-table-menu-gap" aria-hidden="true" />}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {columnMenu && menuOpen && (
        <div
          className="ui-data-table-menu"
          id={menuId}
          role="menu"
          aria-label={menuLabels.columns}
          ref={menuRef}
          onClick={(event) => event.stopPropagation()}
        >
          {normalized.order.map((key, index) => {
            const column = columnsByKey.get(key);
            if (!column) return null;
            const name = columnName(column);
            const visible = !normalized.hidden.includes(key);
            const lastVisible = visible && normalized.order.length - normalized.hidden.length <= 1;
            return (
              <div className="ui-data-table-menu-row" role="none" key={key}>
                <label className="ui-data-table-menu-check">
                  <input
                    type="checkbox"
                    checked={visible}
                    disabled={column.fixed || lastVisible}
                    aria-label={`${menuLabels.show} ${name}`}
                    onChange={() => toggleColumn(key)}
                  />
                  <span className="ui-data-table-menu-name">{name}</span>
                </label>
                <button
                  type="button"
                  className="ui-data-table-menu-move"
                  aria-label={`${menuLabels.moveLeft} ${name}`}
                  disabled={column.fixed || index === 0}
                  onClick={() => moveColumn(key, -1)}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="ui-data-table-menu-move"
                  aria-label={`${menuLabels.moveRight} ${name}`}
                  disabled={column.fixed || index === normalized.order.length - 1}
                  onClick={() => moveColumn(key, 1)}
                >
                  ›
                </button>
              </div>
            );
          })}
          <button type="button" className="ui-data-table-menu-reset" onClick={resetColumns}>
            {menuLabels.reset}
          </button>
        </div>
      )}

      {pagination && (
        <nav className="ui-data-table-pagination" aria-label="Table pagination">
          <span className="ui-data-table-page-range">
            {pageLabels.range(rangeStart, rangeEnd, pagination.total)}
          </span>
          <div className="ui-data-table-page-controls">
            <button
              type="button"
              className="ui-data-table-page-btn"
              aria-label={pageLabels.first}
              disabled={currentPage <= 1}
              onClick={() => goToPage(1)}
            >
              «
            </button>
            <button
              type="button"
              className="ui-data-table-page-btn"
              aria-label={pageLabels.previous}
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              ‹
            </button>
            <span className="ui-data-table-page-status">
              {pageLabels.pageOf(currentPage, totalPages)}
            </span>
            <button
              type="button"
              className="ui-data-table-page-btn"
              aria-label={pageLabels.next}
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              ›
            </button>
            <button
              type="button"
              className="ui-data-table-page-btn"
              aria-label={pageLabels.last}
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(totalPages)}
            >
              »
            </button>
            {pagination.onPageSizeChange && (
              <label className="ui-data-table-page-size">
                <span>{pageLabels.rowsPerPage}</span>
                <select
                  aria-label={pageLabels.rowsPerPage}
                  value={pageSize}
                  onChange={(event) => pagination.onPageSizeChange?.(Number(event.target.value))}
                >
                  {(pagination.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
