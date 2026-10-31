import { describe, it, expect, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, type DataTableColumn } from './DataTable';

interface Row {
  name: string;
  amount: number;
}

const rows: Row[] = [
  { name: 'Coffee', amount: 12 },
  { name: 'Lunch', amount: 30 },
];

const stringColumns: DataTableColumn<Row>[] = [
  { key: 'name', header: 'Name' },
  { key: 'amount', header: 'Amount', align: 'right' },
];

function renderTable(props: Partial<ComponentProps<typeof DataTable<Row>>> = {}) {
  return render(
    <DataTable<Row>
      ariaLabel="Transactions"
      columns={stringColumns}
      rows={rows}
      rowKey={(row) => row.name}
      {...props}
    />,
  );
}

describe('DataTable', () => {
  it('is stacked by default and keeps table semantics', () => {
    const { container } = renderTable();
    const wrap = container.firstElementChild as HTMLElement;

    expect(wrap).toHaveClass('ui-data-table-wrap');
    expect(wrap).toHaveClass('is-stacked');
    expect(screen.getByRole('table', { name: 'Transactions' })).toBeInTheDocument();
    expect(container.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(container.querySelectorAll('thead th')).toHaveLength(2);
  });

  it('drops the stacked class when stacked is false, merging className without gaps', () => {
    const { container } = renderTable({ stacked: false, className: 'my-table' });
    const wrap = container.firstElementChild as HTMLElement;

    expect(wrap).not.toHaveClass('is-stacked');
    expect(wrap.className).toBe('ui-data-table-wrap my-table');
  });

  it('uses a string header as the cell data-label', () => {
    const { container } = renderTable();
    const firstBodyRow = container.querySelectorAll('tbody tr')[0];
    const cells = firstBodyRow.querySelectorAll('td');

    expect(cells[0]).toHaveAttribute('data-label', 'Name');
    expect(cells[1]).toHaveAttribute('data-label', 'Amount');
  });

  it('prefers the label prop when the header is a node', () => {
    const columns: DataTableColumn<Row>[] = [
      { key: 'name', header: <strong>Name</strong>, label: 'Account' },
      { key: 'amount', header: <em>Amount</em> },
    ];
    const { container } = renderTable({ columns });
    const cells = container.querySelectorAll('tbody tr')[0].querySelectorAll('td');

    expect(cells[0]).toHaveAttribute('data-label', 'Account');
    expect(cells[1]).toHaveAttribute('data-label', '');
  });

  it('renders the empty state without a data-label', () => {
    const { container } = renderTable({ rows: [], emptyState: 'Nothing here' });

    const emptyCell = container.querySelector('.ui-data-table-empty') as HTMLTableCellElement;
    expect(emptyCell).toBeInTheDocument();
    expect(emptyCell).toHaveAttribute('colspan', String(stringColumns.length));
    expect(emptyCell).not.toHaveAttribute('data-label');
    expect(within(emptyCell).getByText('Nothing here')).toBeInTheDocument();
  });

  it('reports sort changes and exposes aria-sort', async () => {
    const onSortChange = vi.fn();
    const columns: DataTableColumn<Row>[] = [
      { key: 'name', header: 'Name' },
      { key: 'amount', header: 'Amount', sortable: true },
    ];

    const { container } = renderTable({
      columns,
      sort: { key: 'amount', direction: 'asc' },
      onSortChange,
    });

    const headers = container.querySelectorAll('thead th');
    expect(headers[1]).toHaveAttribute('aria-sort', 'ascending');
    expect(headers[0]).not.toHaveAttribute('aria-sort');

    await userEvent.click(screen.getByRole('button', { name: /Amount/ }));
    expect(onSortChange).toHaveBeenCalledWith({ key: 'amount', direction: 'desc' });
  });

  it('marks sortable but unsorted columns with aria-sort="none"', () => {
    const columns: DataTableColumn<Row>[] = [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'amount', header: 'Amount' },
    ];
    const { container } = renderTable({ columns, onSortChange: vi.fn() });
    const headers = container.querySelectorAll('thead th');

    expect(headers[0]).toHaveAttribute('aria-sort', 'none');
    expect(headers[1]).not.toHaveAttribute('aria-sort');
  });

  it('only draws a sort arrow on the sorted column, never a neutral hint', () => {
    const columns: DataTableColumn<Row>[] = [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'amount', header: 'Amount', sortable: true },
    ];
    const { container } = renderTable({
      columns,
      sort: { key: 'amount', direction: 'desc' },
      onSortChange: vi.fn(),
    });

    const icons = container.querySelectorAll('.ui-data-table-sort-icon');
    expect(icons).toHaveLength(1);
    expect(icons[0]).toHaveTextContent('▼');
  });

  it('activates clickable rows with the keyboard and keeps them focusable', async () => {
    const onRowClick = vi.fn();
    renderTable({ onRowClick });

    const table = screen.getByRole('table', { name: 'Transactions' });
    const row = within(table).getAllByRole('row')[1];
    expect(row).toHaveAttribute('tabindex', '0');
    expect(row).toHaveClass('is-clickable');

    row.focus();
    await userEvent.keyboard('{Enter}');
    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });
});
