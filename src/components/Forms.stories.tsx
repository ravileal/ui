import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Checkbox from './Checkbox';
import DatePicker from './DatePicker';
import Dropdown from './Dropdown';
import MonthSelector from './MonthSelector';
import { NumberStepper } from './NumberStepper';
import Radio from './Radio';

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
