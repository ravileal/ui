import { describe, it, expect, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
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

describe('DataTable resizable columns', () => {
  const resizeColumns: DataTableColumn<Row>[] = [
    { key: 'name', header: 'Name', width: 120, minWidth: 80 },
    { key: 'amount', header: 'Amount', width: 90 },
  ];

  it('renders no resizers unless resizable is on', () => {
    renderTable({ columns: resizeColumns });

    expect(screen.queryAllByRole('separator')).toHaveLength(0);
  });

  it('marks the table resizable and adds one col per column', () => {
    const { container } = renderTable({ columns: resizeColumns, resizable: true });

    expect(screen.getByRole('table', { name: 'Transactions' })).toHaveClass('is-resizable');
    expect(screen.getAllByRole('separator')).toHaveLength(2);
    expect(container.querySelectorAll('colgroup col')).toHaveLength(2);
  });

  it('labels each separator from the column header', () => {
    renderTable({ columns: resizeColumns, resizable: true });

    expect(screen.getByRole('separator', { name: 'Resize Name column' })).toBeInTheDocument();
    expect(screen.getByRole('separator', { name: 'Resize Amount column' })).toBeInTheDocument();
  });

  it('widens the column by 16px on ArrowRight and reports the new width', async () => {
    const onColumnResize = vi.fn();
    renderTable({ columns: resizeColumns, resizable: true, onColumnResize });

    screen.getByRole('separator', { name: 'Resize Name column' }).focus();
    await userEvent.keyboard('{ArrowRight}');

    expect(onColumnResize).toHaveBeenCalledWith('name', 136);
  });

  it('clamps ArrowLeft at the column minWidth', async () => {
    const onColumnResize = vi.fn();
    const columns: DataTableColumn<Row>[] = [
      { key: 'name', header: 'Name', width: 200, minWidth: 80 },
      { key: 'amount', header: 'Amount' },
    ];
    renderTable({ columns, resizable: true, onColumnResize });

    screen.getByRole('separator', { name: 'Resize Name column' }).focus();
    for (let press = 0; press < 10; press += 1) {
      await userEvent.keyboard('{ArrowLeft}');
    }

    const widths = onColumnResize.mock.calls.map((call) => call[1] as number);
    expect(widths.every((width) => width >= 80)).toBe(true);
    expect(onColumnResize).toHaveBeenLastCalledWith('name', 80);
  });

  it('applies a pointer drag live and commits the final width on pointer up', () => {
    const onColumnResize = vi.fn();
    renderTable({ columns: resizeColumns, resizable: true, onColumnResize });
    const separator = screen.getByRole('separator', { name: 'Resize Name column' });
    // jsdom ships no PointerEvent, so the drag is driven with MouseEvents that
    // carry the pointer type name and a real clientX.
    const pointer = (type: string, clientX: number) =>
      fireEvent(separator, new MouseEvent(type, { bubbles: true, cancelable: true, clientX }));

    pointer('pointerdown', 100);
    pointer('pointermove', 160);
    expect(onColumnResize).not.toHaveBeenCalled();
    expect(separator).toHaveClass('is-dragging');

    pointer('pointerup', 160);
    expect(onColumnResize).toHaveBeenCalledWith('name', 180);
    expect(separator).not.toHaveClass('is-dragging');
  });

  it('resets the column to its configured width on Home', async () => {
    const onColumnResize = vi.fn();
    renderTable({ columns: resizeColumns, resizable: true, onColumnResize });

    const separator = screen.getByRole('separator', { name: 'Resize Name column' });
    separator.focus();
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{Home}');

    expect(onColumnResize).toHaveBeenLastCalledWith('name', 120);
  });

  it('ignores ArrowUp and ArrowDown on the separator', async () => {
    const onColumnResize = vi.fn();
    renderTable({ columns: resizeColumns, resizable: true, onColumnResize });

    screen.getByRole('separator', { name: 'Resize Name column' }).focus();
    await userEvent.keyboard('{ArrowUp}{ArrowDown}');

    expect(onColumnResize).not.toHaveBeenCalled();
  });
});

describe('DataTable column menu', () => {
  const menuColumns: DataTableColumn<Row>[] = [
    { key: 'name', header: 'Name' },
    { key: 'amount', header: 'Amount' },
  ];

  const openMenu = async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Column options' }));
    return screen.getByRole('menu', { name: 'Columns' });
  };

  it('renders the trigger only when columnMenu is on', () => {
    renderTable({ columns: menuColumns });
    expect(screen.queryByRole('button', { name: 'Column options' })).not.toBeInTheDocument();
  });

  it('toggles aria-expanded and lists every column', async () => {
    renderTable({ columns: menuColumns, columnMenu: true });
    const trigger = screen.getByRole('button', { name: 'Column options' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('data-state', 'closed');

    const panel = await openMenu();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('data-state', 'open');
    expect(within(panel).getAllByRole('checkbox')).toHaveLength(2);
  });

  it('removes a hidden column from the header and from every body row', async () => {
    const { container } = renderTable({ columns: menuColumns, columnMenu: true });

    await openMenu();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Show Amount' }));

    expect(screen.queryByRole('columnheader', { name: 'Amount' })).not.toBeInTheDocument();
    for (const row of container.querySelectorAll('tbody tr')) {
      expect(row.querySelectorAll('td[data-label]')).toHaveLength(1);
    }
    expect(container.querySelectorAll('tbody tr')[0].querySelectorAll('td')[0]).toHaveAttribute(
      'data-label',
      'Name',
    );
  });

  it('keeps the empty-state colSpan in step with the visible columns', async () => {
    const { container } = renderTable({ columns: menuColumns, columnMenu: true, rows: [] });
    const emptyCell = () => container.querySelector('.ui-data-table-empty');

    expect(emptyCell()).toHaveAttribute('colspan', '3');

    await openMenu();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Show Amount' }));

    expect(emptyCell()).toHaveAttribute('colspan', '2');
  });

  it('moves a column one position right', async () => {
    const { container } = renderTable({ columns: menuColumns, columnMenu: true });

    await openMenu();
    await userEvent.click(screen.getByRole('button', { name: 'Move right Name' }));

    const headers = [...container.querySelectorAll('thead th[scope="col"]')].map((th) =>
      (th.textContent ?? '').trim(),
    );
    expect(headers.slice(0, 2)).toEqual(['Amount', 'Name']);
  });

  it('disables moving past the edges', async () => {
    renderTable({ columns: menuColumns, columnMenu: true });

    await openMenu();
    expect(screen.getByRole('button', { name: 'Move left Name' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move right Amount' })).toBeDisabled();
  });

  it('never lets a fixed column be hidden or moved', async () => {
    const fixedColumns: DataTableColumn<Row>[] = [
      { key: 'name', header: 'Name', fixed: true },
      { key: 'amount', header: 'Amount' },
    ];
    renderTable({ columns: fixedColumns, columnMenu: true });

    await openMenu();
    expect(screen.getByRole('checkbox', { name: 'Show Name' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move left Name' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move right Name' })).toBeDisabled();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
  });

  it('prevents hiding the last visible column', async () => {
    renderTable({ columns: menuColumns, columnMenu: true });

    await openMenu();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Show Amount' }));

    const nameCheckbox = screen.getByRole('checkbox', { name: 'Show Name' });
    expect(nameCheckbox).toBeDisabled();
    await userEvent.click(nameCheckbox);
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    renderTable({ columns: menuColumns, columnMenu: true });
    const trigger = screen.getByRole('button', { name: 'Column options' });

    await openMenu();
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes when clicking outside the panel', async () => {
    renderTable({ columns: menuColumns, columnMenu: true });

    await openMenu();
    await userEvent.click(document.body);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('reports the new order and hidden keys', async () => {
    const onColumnSettingsChange = vi.fn();
    renderTable({ columns: menuColumns, columnMenu: true, onColumnSettingsChange });

    await openMenu();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Show Amount' }));
    expect(onColumnSettingsChange).toHaveBeenLastCalledWith({
      order: ['name', 'amount'],
      hidden: ['amount'],
    });

    await userEvent.click(screen.getByRole('button', { name: 'Move right Name' }));
    expect(onColumnSettingsChange).toHaveBeenLastCalledWith({
      order: ['amount', 'name'],
      hidden: ['amount'],
    });
  });

  it('resets order and visibility but leaves widths alone', async () => {
    const onColumnSettingsChange = vi.fn();
    renderTable({ columns: menuColumns, columnMenu: true, onColumnSettingsChange });

    await openMenu();
    await userEvent.click(screen.getByRole('button', { name: 'Move right Name' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Show Amount' }));
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(onColumnSettingsChange).toHaveBeenLastCalledWith({
      order: ['name', 'amount'],
      hidden: [],
    });
  });

  it('honours defaultHidden on first render', () => {
    const columns: DataTableColumn<Row>[] = [
      { key: 'name', header: 'Name' },
      { key: 'amount', header: 'Amount', defaultHidden: true },
    ];
    renderTable({ columns, columnMenu: true });

    expect(screen.queryByRole('columnheader', { name: 'Amount' })).not.toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
  });
});

describe('DataTable pagination', () => {
  it('shows the range and the page indicator', () => {
    renderTable({ pagination: { page: 1, pageSize: 25, total: 320, onPageChange: vi.fn() } });
    const nav = screen.getByRole('navigation', { name: 'Table pagination' });

    expect(within(nav).getByText('1-25 of 320')).toBeInTheDocument();
    expect(within(nav).getByText('Page 1 of 13')).toBeInTheDocument();
  });

  it('shows 0-0 of 0 for an empty result set', () => {
    renderTable({
      rows: [],
      pagination: { page: 1, pageSize: 25, total: 0, onPageChange: vi.fn() },
    });
    const nav = screen.getByRole('navigation', { name: 'Table pagination' });

    expect(within(nav).getByText('0-0 of 0')).toBeInTheDocument();
    expect(within(nav).getByText('Page 1 of 1')).toBeInTheDocument();
  });

  it('disables first and previous on the first page', () => {
    renderTable({ pagination: { page: 1, pageSize: 25, total: 320, onPageChange: vi.fn() } });
    const nav = screen.getByRole('navigation', { name: 'Table pagination' });

    expect(within(nav).getByRole('button', { name: 'First page' })).toBeDisabled();
    expect(within(nav).getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(within(nav).getByRole('button', { name: 'Next page' })).toBeEnabled();
    expect(within(nav).getByRole('button', { name: 'Last page' })).toBeEnabled();
  });

  it('walks forward one page and jumps to the last page', async () => {
    const onPageChange = vi.fn();
    renderTable({ pagination: { page: 1, pageSize: 25, total: 320, onPageChange } });
    const nav = screen.getByRole('navigation', { name: 'Table pagination' });

    await userEvent.click(within(nav).getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);

    await userEvent.click(within(nav).getByRole('button', { name: 'Last page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(13);
  });

  it('disables next and last on the last page', () => {
    renderTable({ pagination: { page: 13, pageSize: 25, total: 320, onPageChange: vi.fn() } });
    const nav = screen.getByRole('navigation', { name: 'Table pagination' });

    expect(within(nav).getByText('301-320 of 320')).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(within(nav).getByRole('button', { name: 'Last page' })).toBeDisabled();
    expect(within(nav).getByRole('button', { name: 'First page' })).toBeEnabled();
  });

  it('reports page-size changes from the select', async () => {
    const onPageSizeChange = vi.fn();
    renderTable({
      pagination: {
        page: 1,
        pageSize: 25,
        total: 320,
        onPageChange: vi.fn(),
        onPageSizeChange,
      },
    });

    const select = screen.getByRole('combobox', { name: 'Rows per page' });
    expect(select).toHaveValue('25');

    await userEvent.selectOptions(select, '50');
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });

  it('renders no page-size select without onPageSizeChange', () => {
    renderTable({ pagination: { page: 1, pageSize: 25, total: 320, onPageChange: vi.fn() } });

    expect(screen.queryByRole('combobox', { name: 'Rows per page' })).not.toBeInTheDocument();
  });

  it('accepts custom labels', () => {
    renderTable({
      pagination: {
        page: 2,
        pageSize: 10,
        total: 95,
        onPageChange: vi.fn(),
        labels: { pageOf: (page, pages) => `${page}/${pages}`, next: 'Forward' },
      },
    });

    expect(screen.getByText('2/10')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Forward' })).toBeInTheDocument();
  });
});
