import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';
import Combobox from './Combobox';
import { DataTable, type DataTableColumn } from './DataTable';
import { Drawer } from './Drawer';
import { FileUpload, type FileRejection } from './FileUpload';

const meta: Meta = {
  title: 'Advanced',
};
export default meta;

type Story = StoryObj;

const OPTIONS = [
  { value: 'food', label: 'Food', description: 'Groceries and restaurants' },
  { value: 'transport', label: 'Transport', description: 'Uber, metro and fuel' },
  { value: 'home', label: 'Home', description: 'Rent, utilities and repairs' },
];

function ComboboxExample() {
  const [value, setValue] = useState('food');
  return (
    <div style={{ width: 320 }}>
      <Combobox
        value={value}
        onChange={setValue}
        options={OPTIONS}
        ariaLabel="Category"
        placeholder="Search categories…"
      />
    </div>
  );
}

function DrawerExample() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open drawer</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Filters"
        footer={<Button onClick={() => setOpen(false)}>Apply</Button>}
      >
        Drawer content. The footer stays pinned to the bottom.
      </Drawer>
    </>
  );
}

interface Row {
  name: string;
  amount: number;
}

const rows: Row[] = [
  { name: 'Coffee', amount: 12 },
  { name: 'Lunch', amount: 30 },
  { name: 'Taxi', amount: 18 },
];

function DataTableExample() {
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'amount',
    direction: 'asc',
  });
  const sorted = [...rows].sort((a, b) => {
    const direction = sort.direction === 'asc' ? 1 : -1;
    if (sort.key === 'name') return a.name.localeCompare(b.name) * direction;
    return (a.amount - b.amount) * direction;
  });

  return (
    <div style={{ width: 480 }}>
      <DataTable
        ariaLabel="Transactions"
        columns={[
          { key: 'name', header: 'Name', sortable: true },
          { key: 'amount', header: 'Amount', sortable: true, align: 'right' },
        ]}
        rows={sorted}
        rowKey={(row) => row.name}
        sort={sort}
        onSortChange={setSort}
      />
    </div>
  );
}

interface ControlsRow {
  id: string;
  item: string;
  category: string;
  owner: string;
  amount: number;
  updated: string;
}

const CONTROLS_ROWS: ControlsRow[] = Array.from({ length: 40 }, (_, index) => {
  const categories = ['Food', 'Transport', 'Home', 'Leisure', 'Health'];
  const owners = ['Ana', 'Bruno', 'Carla', 'Diego'];
  return {
    id: `row-${index + 1}`,
    item: `Expense ${String(index + 1).padStart(2, '0')}`,
    category: categories[index % categories.length],
    owner: owners[index % owners.length],
    amount: 18 + ((index * 37) % 420),
    updated: `2026-03-${String((index % 28) + 1).padStart(2, '0')}`,
  };
});

const CONTROLS_COLUMNS: DataTableColumn<ControlsRow>[] = [
  { key: 'item', header: 'Item', width: 180, minWidth: 120 },
  { key: 'category', header: 'Category', width: 140 },
  { key: 'owner', header: 'Owner', width: 140 },
  { key: 'amount', header: 'Amount', width: 110, align: 'right', minWidth: 90 },
  { key: 'updated', header: 'Updated', width: 140 },
];

function DataTableControlsExample() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const first = (page - 1) * pageSize;
  const visible = CONTROLS_ROWS.slice(first, first + pageSize);

  return (
    <div style={{ width: 760 }}>
      <DataTable
        ariaLabel="Team spend"
        columns={CONTROLS_COLUMNS}
        rows={visible}
        rowKey={(row) => row.id}
        resizable
        columnMenu
        pagination={{
          page,
          pageSize,
          total: CONTROLS_ROWS.length,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
        }}
      />
    </div>
  );
}

function FileUploadExample() {
  const [files, setFiles] = useState<string[]>([]);
  const [rejections, setRejections] = useState<FileRejection[]>([]);
  return (
    <div style={{ display: 'grid', gap: 10, width: 360 }}>
      <FileUpload
        multiple
        accept="image/png,image/jpeg,.pdf"
        maxSize={1048576}
        onFiles={(selected) => {
          setFiles(selected.map((file) => file.name));
          setRejections([]);
        }}
        onFilesRejected={setRejections}
        hint="PNG, JPEG or PDF up to 1 MB"
      />
      {files.map((file) => (
        <div key={file} style={{ color: 'var(--ui-text-2)', fontSize: 12 }}>
          {file}
        </div>
      ))}
      {rejections.map((rejection, index) => (
        <div
          key={`${rejection.file.name}-${index}`}
          style={{ color: 'var(--ui-red)', fontSize: 12 }}
        >
          {rejection.reason}: {rejection.message}
        </div>
      ))}
    </div>
  );
}

function FileUploadFreeExample() {
  const [files, setFiles] = useState<string[]>([]);
  return (
    <div style={{ display: 'grid', gap: 10, width: 360 }}>
      <FileUpload
        multiple
        onFiles={(selected) => setFiles(selected.map((file) => file.name))}
        hint="Any file type, any size"
      />
      {files.map((file) => (
        <div key={file} style={{ color: 'var(--ui-text-2)', fontSize: 12 }}>
          {file}
        </div>
      ))}
    </div>
  );
}

export const ComboboxStory: Story = { name: 'Combobox', render: () => <ComboboxExample /> };
export const DrawerStory: Story = { name: 'Drawer', render: () => <DrawerExample /> };
export const Table: Story = { render: () => <DataTableExample /> };
export const TableControls: Story = {
  name: 'Table controls',
  render: () => <DataTableControlsExample />,
};
export const Upload: Story = { render: () => <FileUploadExample /> };
export const UploadFree: Story = {
  name: 'Upload (no restrictions)',
  render: () => <FileUploadFreeExample />,
};
