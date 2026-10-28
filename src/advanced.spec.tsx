import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Combobox from './components/Combobox';
import { DataTable } from './components/DataTable';
import { FileUpload } from './components/FileUpload';
import { SegmentedControl } from './components/SegmentedControl';
import { Tabs } from './components/Tabs';

const OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
];

describe('Combobox', () => {
  it('filters, selects and closes', async () => {
    const onChange = vi.fn();
    render(<Combobox value="" onChange={onChange} options={OPTIONS} ariaLabel="Fruit" />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });

    await userEvent.click(input);
    expect(screen.getByRole('listbox', { name: 'Fruit' })).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);

    await userEvent.type(input, 'ban');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    await userEvent.click(screen.getByRole('option', { name: 'Banana' }));

    expect(onChange).toHaveBeenCalledWith('banana');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('selects the active option with the keyboard', async () => {
    const onChange = vi.fn();
    render(<Combobox value="" onChange={onChange} options={OPTIONS} ariaLabel="Fruit" />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith('banana');
  });

  it('shows the empty state when nothing matches', async () => {
    render(<Combobox value="" onChange={vi.fn()} options={OPTIONS} ariaLabel="Fruit" />);
    await userEvent.type(screen.getByRole('combobox', { name: 'Fruit' }), 'zzz');
    expect(screen.getByText('No results')).toBeInTheDocument();
  });
});

describe('Tabs', () => {
  it('changes tabs by click and keyboard', async () => {
    const onChange = vi.fn();
    render(
      <Tabs
        ariaLabel="Views"
        value="list"
        onChange={onChange}
        items={[
          { id: 'list', label: 'List' },
          { id: 'calendar', label: 'Calendar' },
          { id: 'chart', label: 'Chart', disabled: true },
        ]}
      />,
    );
    expect(screen.getByRole('tab', { name: 'List' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(screen.getByRole('tab', { name: 'Calendar' }));
    expect(onChange).toHaveBeenCalledWith('calendar');

    const listTab = screen.getByRole('tab', { name: 'List' });
    listTab.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('calendar');
  });
});

describe('SegmentedControl', () => {
  it('changes the selection by click and arrow keys', async () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        ariaLabel="Period"
        value="week"
        onChange={onChange}
        items={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole('radio', { name: 'Day' }));
    expect(onChange).toHaveBeenCalledWith('day');

    const week = screen.getByRole('radio', { name: 'Week' });
    week.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('month');
  });
});

interface Row {
  name: string;
  amount: number;
}

describe('DataTable', () => {
  const columns = [
    { key: 'name', header: 'Name', render: (row: Row) => row.name },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (row: Row) => `$${row.amount}`,
    },
  ];
  const rows: Row[] = [
    { name: 'Coffee', amount: 12 },
    { name: 'Lunch', amount: 30 },
  ];

  it('renders columns and rows', () => {
    render(
      <DataTable
        ariaLabel="Transactions"
        columns={columns}
        rows={rows}
        rowKey={(row) => row.name}
      />,
    );
    expect(screen.getByRole('table', { name: 'Transactions' })).toBeInTheDocument();
    expect(screen.getByText('Coffee')).toBeInTheDocument();
    expect(screen.getByText('$30')).toBeInTheDocument();
  });

  it('reports sort changes', async () => {
    const onSortChange = vi.fn();
    render(
      <DataTable
        ariaLabel="Transactions"
        columns={columns}
        rows={rows}
        rowKey={(row) => row.name}
        sort={{ key: 'amount', direction: 'asc' }}
        onSortChange={onSortChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Amount/ }));
    expect(onSortChange).toHaveBeenCalledWith({ key: 'amount', direction: 'desc' });
  });

  it('renders the empty state', () => {
    render(
      <DataTable
        ariaLabel="Transactions"
        columns={columns}
        rows={[]}
        rowKey={() => ''}
        emptyState="Nothing here"
      />,
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('opens a row by click and keyboard', async () => {
    const onRowClick = vi.fn();
    render(
      <DataTable
        ariaLabel="Transactions"
        columns={columns}
        rows={rows}
        rowKey={(row) => row.name}
        onRowClick={onRowClick}
      />,
    );
    const row = screen.getByText('Coffee').closest('tr')!;
    await userEvent.click(row);
    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
    fireEvent.keyDown(row, { key: 'Enter' });
    expect(onRowClick).toHaveBeenCalledTimes(2);
  });
});

describe('FileUpload', () => {
  it('reports files selected through the input', () => {
    const onFiles = vi.fn();
    const { container } = render(<FileUpload onFiles={onFiles} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });

    fireEvent.change(input, { target: { files: [file] } });
    expect(onFiles).toHaveBeenCalledWith([file]);
  });

  it('reports dropped files and respects disabled state', () => {
    const onFiles = vi.fn();
    const { rerender } = render(<FileUpload onFiles={onFiles} />);
    const zone = screen.getByRole('button');
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });

    fireEvent.drop(zone, { dataTransfer: { files: [file] } });
    expect(onFiles).toHaveBeenCalledWith([file]);

    rerender(<FileUpload onFiles={onFiles} disabled />);
    fireEvent.drop(screen.getByRole('button'), { dataTransfer: { files: [file] } });
    expect(onFiles).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });
});
