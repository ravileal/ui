import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Combobox from './components/Combobox';
import { DataTable } from './components/DataTable';
import { FileUpload, type FileRejection } from './components/FileUpload';
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
  const fileOf = (name: string, type: string, bytes = 5) =>
    new File([new Uint8Array(bytes)], name, { type });

  const inputOf = (container: HTMLElement) =>
    container.querySelector('input[type="file"]') as HTMLInputElement;

  const select = (container: HTMLElement, files: File[]) => {
    fireEvent.change(inputOf(container), { target: { files } });
  };

  it('reports files selected through the input', () => {
    const onFiles = vi.fn();
    const { container } = render(<FileUpload onFiles={onFiles} />);
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });

    fireEvent.change(inputOf(container), { target: { files: [file] } });
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

  it('accepts a file whose mime type matches an exact accept token', () => {
    const onFiles = vi.fn();
    const onFilesRejected = vi.fn();
    const { container } = render(
      <FileUpload onFiles={onFiles} onFilesRejected={onFilesRejected} accept="image/png" />,
    );
    const file = fileOf('logo.png', 'image/png');

    select(container, [file]);
    expect(onFiles).toHaveBeenCalledWith([file]);
    expect(onFilesRejected).not.toHaveBeenCalled();
  });

  it('accepts a file through a wildcard subtype token', () => {
    const onFiles = vi.fn();
    const { container } = render(<FileUpload onFiles={onFiles} accept="image/*" />);
    const file = fileOf('photo.webp', 'image/webp');

    select(container, [file]);
    expect(onFiles).toHaveBeenCalledWith([file]);
  });

  it('accepts a file whose extension matches a dot token, case insensitively', () => {
    const onFiles = vi.fn();
    const { container } = render(<FileUpload onFiles={onFiles} accept=".PDF" />);
    const file = fileOf('report.PDF', '');

    select(container, [file]);
    expect(onFiles).toHaveBeenCalledWith([file]);
  });

  it('rejects a mismatched type without calling onFiles', () => {
    const onFiles = vi.fn();
    const onFilesRejected = vi.fn();
    const { container } = render(
      <FileUpload onFiles={onFiles} onFilesRejected={onFilesRejected} accept="image/png" />,
    );
    const file = fileOf('notes.txt', 'text/plain');

    select(container, [file]);
    expect(onFiles).not.toHaveBeenCalled();
    expect(onFilesRejected).toHaveBeenCalledTimes(1);
    const [rejections] = onFilesRejected.mock.calls[0] as [FileRejection[]];
    expect(rejections).toHaveLength(1);
    expect(rejections[0].reason).toBe('type');
    expect(rejections[0].file).toBe(file);
    expect(rejections[0].message).toBe('notes.txt: file type not allowed');
  });

  it('rejects a file above maxSize and accepts one exactly at the limit', () => {
    const onFiles = vi.fn();
    const onFilesRejected = vi.fn();
    const { container } = render(
      <FileUpload onFiles={onFiles} onFilesRejected={onFilesRejected} maxSize={1024} />,
    );

    select(container, [fileOf('big.bin', 'application/octet-stream', 1025)]);
    expect(onFiles).not.toHaveBeenCalled();
    const [rejections] = onFilesRejected.mock.calls[0] as [FileRejection[]];
    expect(rejections[0].reason).toBe('size');
    expect(rejections[0].message).toBe('big.bin: file is too large (max 1 KB)');

    const atLimit = fileOf('edge.bin', 'application/octet-stream', 1024);
    select(container, [atLimit]);
    expect(onFiles).toHaveBeenCalledWith([atLimit]);
  });

  it('splits a mixed batch into accepted files and rejections', () => {
    const onFiles = vi.fn();
    const onFilesRejected = vi.fn();
    const { container } = render(
      <FileUpload onFiles={onFiles} onFilesRejected={onFilesRejected} accept=".pdf" />,
    );
    const good = fileOf('report.pdf', 'application/pdf');
    const bad = fileOf('notes.txt', 'text/plain');

    select(container, [good, bad]);
    expect(onFiles).toHaveBeenCalledWith([good]);
    const [rejections] = onFilesRejected.mock.calls[0] as [FileRejection[]];
    expect(rejections.map((rejection) => rejection.file)).toEqual([bad]);
  });

  it('reports a custom validator failure with reason custom', () => {
    const onFiles = vi.fn();
    const onFilesRejected = vi.fn();
    const { container } = render(
      <FileUpload
        onFiles={onFiles}
        onFilesRejected={onFilesRejected}
        validateFile={(file) => (file.name.startsWith('draft') ? 'drafts are not allowed' : null)}
      />,
    );

    select(container, [fileOf('draft.pdf', 'application/pdf')]);
    expect(onFiles).not.toHaveBeenCalled();
    const [rejections] = onFilesRejected.mock.calls[0] as [FileRejection[]];
    expect(rejections[0].reason).toBe('custom');
    expect(rejections[0].message).toBe('drafts are not allowed');
  });

  it('renders an alert for rejections and clears it on a valid selection', () => {
    const { container } = render(<FileUpload onFiles={vi.fn()} accept=".pdf" />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    select(container, [fileOf('notes.txt', 'text/plain')]);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('ui-file-upload-error');
    expect(alert).toHaveTextContent('notes.txt: file type not allowed');

    select(container, [fileOf('report.pdf', 'application/pdf')]);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('toggles is-invalid and aria-invalid on the zone', () => {
    const { container } = render(<FileUpload onFiles={vi.fn()} accept=".pdf" />);

    select(container, [fileOf('notes.txt', 'text/plain')]);
    const zone = screen.getByRole('button');
    expect(zone).toHaveClass('is-invalid');
    expect(zone).toHaveAttribute('aria-invalid', 'true');

    select(container, [fileOf('report.pdf', 'application/pdf')]);
    expect(zone).not.toHaveClass('is-invalid');
    expect(zone).toHaveAttribute('aria-invalid', 'false');
  });

  it('renders the error prop instead of the internal message', () => {
    const { container } = render(
      <FileUpload onFiles={vi.fn()} accept=".pdf" error={<span>Upload blocked</span>} />,
    );

    select(container, [fileOf('notes.txt', 'text/plain')]);
    expect(screen.getByRole('alert')).toHaveTextContent('Upload blocked');
  });

  it('honours label overrides with %name% and %max% interpolation', () => {
    const onFilesRejected = vi.fn();
    const { container } = render(
      <FileUpload
        onFiles={vi.fn()}
        onFilesRejected={onFilesRejected}
        maxSize={1536}
        labels={{ tooLarge: '%name% exceeds %max%' }}
      />,
    );

    select(container, [fileOf('huge.bin', 'application/octet-stream', 2000)]);
    const [rejections] = onFilesRejected.mock.calls[0] as [FileRejection[]];
    expect(rejections[0].message).toBe('huge.bin exceeds 1.5 KB');
  });

  it('keeps only the first file when multiple is false', () => {
    const onFiles = vi.fn();
    const onFilesRejected = vi.fn();
    const { container } = render(
      <FileUpload onFiles={onFiles} onFilesRejected={onFilesRejected} />,
    );
    const first = fileOf('a.txt', 'text/plain');
    const second = fileOf('b.txt', 'text/plain');

    select(container, [first, second]);
    expect(onFiles).toHaveBeenCalledWith([first]);
    const [rejections] = onFilesRejected.mock.calls[0] as [FileRejection[]];
    expect(rejections).toHaveLength(1);
    expect(rejections[0].file).toBe(second);
    expect(rejections[0].reason).toBe('custom');
    expect(rejections[0].message).toBe('b.txt: invalid file');
  });

  it('validates dropped files with the same rules as the picker', () => {
    const onFiles = vi.fn();
    const onFilesRejected = vi.fn();
    render(
      <FileUpload
        onFiles={onFiles}
        onFilesRejected={onFilesRejected}
        accept="image/png"
        maxSize={100}
      />,
    );

    fireEvent.drop(screen.getByRole('button'), {
      dataTransfer: { files: [fileOf('shot.png', 'image/png', 500)] },
    });
    expect(onFiles).not.toHaveBeenCalled();
    const [rejections] = onFilesRejected.mock.calls[0] as [FileRejection[]];
    expect(rejections[0].reason).toBe('size');
  });

  it('clears the input value so the same file can be selected again', () => {
    const { container } = render(<FileUpload onFiles={vi.fn()} accept=".pdf" />);
    const input = inputOf(container);
    const file = fileOf('notes.txt', 'text/plain');

    fireEvent.change(input, { target: { files: [file] } });
    expect(input.value).toBe('');
  });
});
