import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Checkbox from './Checkbox';
import DatePicker from './DatePicker';
import Dropdown from './Dropdown';
import MonthSelector from './MonthSelector';
import { NumberStepper } from './NumberStepper';
import Radio from './Radio';
import Select from './Select';

const MONTHS = [
  { value: '2026-10', label: 'Oct 2026' },
  { value: '2026-09', label: 'Sep 2026' },
  { value: '2026-08', label: 'Aug 2026' },
];

function DropdownExample() {
  const [value, setValue] = useState('food');
  return (
    <div style={{ width: 240 }}>
      <Dropdown
        ariaLabel="Category"
        value={value}
        onChange={setValue}
        options={[
          { value: 'food', label: 'Food', color: '#00c9a7' },
          { value: 'transport', label: 'Transport', color: '#4f7cff' },
          { value: 'home', label: 'Home', color: '#f59e0b' },
        ]}
      />
    </div>
  );
}

function DatePickerExample() {
  const [value, setValue] = useState('2026-03-30');
  return (
    <div style={{ width: 240 }}>
      <DatePicker value={value} onChange={setValue} locale="en-US" />
    </div>
  );
}

function SelectExample() {
  const [value, setValue] = useState<string | number | null>('groceries');
  return (
    <div style={{ width: 260, display: 'grid', gap: 12 }}>
      <Select
        ariaLabel="Category"
        value={value}
        onChange={setValue}
        options={[
          { value: 'groceries', label: 'Groceries', description: 'Supermarket and household' },
          { value: 'dining', label: 'Dining', description: 'Restaurants and coffee' },
          { value: 'travel', label: 'Travel' },
          { value: 'archived', label: 'Archived', disabled: true },
        ]}
      />
    </div>
  );
}

function SelectSmallExample() {
  const [value, setValue] = useState<string | number | null>(20);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, color: 'var(--ui-text-2)' }}>Rows per page</span>
      <Select
        ariaLabel="Rows per page"
        size="sm"
        fullWidth={false}
        value={value}
        onChange={setValue}
        options={[
          { value: 10, label: '10' },
          { value: 20, label: '20' },
          { value: 50, label: '50' },
        ]}
      />
    </div>
  );
}

function SelectInvalidExample() {
  const [value, setValue] = useState<string | number | null>(null);
  const accounts = [
    { value: 'checking', label: 'Checking' },
    { value: 'savings', label: 'Savings' },
  ];
  return (
    <div style={{ width: 260, display: 'grid', gap: 12 }}>
      <Select
        ariaLabel="Account"
        value={value}
        onChange={setValue}
        invalid
        placeholder="Pick an account"
        options={accounts}
      />
      <Select
        ariaLabel="Locked account"
        value="savings"
        onChange={() => {}}
        disabled
        options={accounts}
      />
    </div>
  );
}

function DatePickerPtBrExample() {
  const [value, setValue] = useState('2026-03-30');
  return (
    <div style={{ width: 240 }}>
      <DatePicker
        value={value}
        onChange={setValue}
        locale="pt-BR"
        ariaLabel="Data"
        placeholder="Selecione a data"
        previousMonthLabel="Mês anterior"
        nextMonthLabel="Próximo mês"
        clearLabel="Limpar"
        todayLabel="Hoje"
      />
    </div>
  );
}

function MonthSelectorExample() {
  const [value, setValue] = useState('2026-10');
  return (
    <MonthSelector
      selectedMonth={value}
      setSelectedMonth={setValue}
      options={MONTHS}
      ariaLabel="Select month"
    />
  );
}

function NumberStepperExample() {
  const [value, setValue] = useState(113);
  return <NumberStepper ariaLabel="Green" value={value} onChange={setValue} />;
}

const meta: Meta = {
  title: 'Forms',
};
export default meta;

type Story = StoryObj;

export const BooleanControls: Story = {
  name: 'Checkbox and Radio',
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Checkbox defaultChecked /> Include hidden items
      </label>
      <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Radio name="example" defaultChecked /> Download
      </label>
      <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Radio name="example" /> Clipboard
      </label>
    </div>
  ),
};

export const NumberStepperStory: Story = {
  name: 'NumberStepper',
  render: () => <NumberStepperExample />,
};

export const DropdownStory: Story = {
  name: 'Dropdown',
  render: () => <DropdownExample />,
};

export const SelectStory: Story = {
  name: 'Select',
  render: () => <SelectExample />,
};

export const SelectSmallStory: Story = {
  name: 'Select (sm)',
  render: () => <SelectSmallExample />,
};

export const SelectInvalidStory: Story = {
  name: 'Select (invalid, disabled)',
  render: () => <SelectInvalidExample />,
};

export const DatePickerStory: Story = {
  name: 'DatePicker',
  render: () => <DatePickerExample />,
};

export const DatePickerPtBrStory: Story = {
  name: 'DatePicker (pt-BR)',
  render: () => <DatePickerPtBrExample />,
};

export const MonthSelectorStory: Story = {
  name: 'MonthSelector',
  render: () => <MonthSelectorExample />,
};
