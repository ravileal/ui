import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';
import Combobox from './Combobox';
import { DataTable } from './DataTable';
import { Drawer } from './Drawer';
import { FileUpload } from './FileUpload';

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

function FileUploadExample() {
  const [files, setFiles] = useState<string[]>([]);
  return (
    <div style={{ display: 'grid', gap: 10, width: 360 }}>
      <FileUpload
        multiple
        onFiles={(selected) => setFiles(selected.map((file) => file.name))}
        hint="PDF, CSV or images"
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
export const Upload: Story = { render: () => <FileUploadExample /> };
