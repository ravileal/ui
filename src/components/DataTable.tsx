import type { CSSProperties, ReactNode } from 'react';

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  /** Text used as the per-cell `data-label` in stacked/card mode. */
  label?: string;
  render?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
}

export interface DataTableSort {
  key: string;
  direction: 'asc' | 'desc';
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
  className?: string;
  style?: CSSProperties;
}

/**
 * Column label used for the `data-label` attribute of body cells. Falls back to
 * the header when it is plain text, and to an empty string for node headers.
 */
function cellLabel<T>(column: DataTableColumn<T>): string {
  if (column.label !== undefined) return column.label;
  return typeof column.header === 'string' ? column.header : '';
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
  className,
  style,
}: DataTableProps<T>) {
  return (
    <div
      className={['ui-data-table-wrap', stacked ? 'is-stacked' : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <table className="ui-data-table" aria-label={ariaLabel}>
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            {columns.map((column) => {
              const activeSort = sort?.key === column.key ? sort.direction : undefined;
              return (
                <th
                  key={column.key}
                  scope="col"
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
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="ui-data-table-empty" colSpan={columns.length}>
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
                {columns.map((column) => (
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
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
