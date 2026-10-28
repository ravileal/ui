import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import FormField from './FormField';
import SearchInput from './SearchInput';
import Slider from './Slider';
import Switch from './Switch';
import TextInput from './TextInput';
import Textarea from './Textarea';

const meta: Meta = {
  title: 'Inputs',
};
export default meta;

type Story = StoryObj;

function TextInputExample() {
  const [value, setValue] = useState('Groceries');
  return (
    <div style={{ display: 'grid', gap: 12, width: 320 }}>
      <TextInput
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label="Alias"
      />
      <TextInput value="" placeholder="Disabled" aria-label="Disabled" disabled />
      <TextInput value="Invalid" invalid onChange={() => {}} aria-label="Invalid" />
    </div>
  );
}

function SearchExample() {
  const [value, setValue] = useState('');
  return (
    <div style={{ width: 320 }}>
      <SearchInput
        value={value}
        onChange={setValue}
        ariaLabel="Search aliases"
        placeholder="Search aliases"
      />
    </div>
  );
}

function FormExample() {
  const [name, setName] = useState('');
  return (
    <div style={{ width: 320 }}>
      <FormField
        label="Partner name"
        hint="Used in the dashboard and reports."
        error={name ? undefined : 'Name is required'}
        required
      >
        <TextInput value={name} onChange={(event) => setName(event.target.value)} />
      </FormField>
    </div>
  );
}

function SwitchExample() {
  const [checked, setChecked] = useState(true);
  return (
    <div style={{ display: 'grid', gap: 16, width: 360 }}>
      <Switch
        checked={checked}
        onChange={setChecked}
        label="Monthly summary"
        description="Get a nudge at the end of each month"
      />
      <Switch checked={false} onChange={() => {}} label="Disabled" disabled />
      <Switch checked onChange={() => {}} label="Compact" size="sm" />
    </div>
  );
}

function SliderExample() {
  const [value, setValue] = useState(60);
  return (
    <div style={{ width: 320 }}>
      <Slider label="Split ratio" value={value} onChange={setValue} formatValue={(v) => `${v}%`} />
    </div>
  );
}

export const Text: Story = { render: () => <TextInputExample /> };
export const Search: Story = { render: () => <SearchExample /> };
export const Form: Story = { render: () => <FormExample /> };
export const Toggles: Story = { render: () => <SwitchExample /> };
export const SliderStory: Story = { name: 'Slider', render: () => <SliderExample /> };
export const Multiline: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Textarea aria-label="Notes" placeholder="Add a note…" />
    </div>
  ),
};
