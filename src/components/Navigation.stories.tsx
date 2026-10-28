import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DropdownMenu } from './DropdownMenu';
import { SegmentedControl } from './SegmentedControl';
import { Tabs } from './Tabs';

const meta: Meta = {
  title: 'Navigation',
};
export default meta;

type Story = StoryObj;

function TabsExample() {
  const [value, setValue] = useState('list');
  return (
    <div style={{ width: 420 }}>
      <Tabs
        ariaLabel="Views"
        value={value}
        onChange={setValue}
        items={[
          { id: 'list', label: 'List' },
          { id: 'calendar', label: 'Calendar' },
          { id: 'chart', label: 'Chart' },
        ]}
      />
      <p style={{ marginTop: 12, color: 'var(--ui-text-2)' }}>Selected: {value}</p>
    </div>
  );
}

function SegmentedExample() {
  const [value, setValue] = useState('week');
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <SegmentedControl
        ariaLabel="Period"
        value={value}
        onChange={setValue}
        items={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
        ]}
      />
      <SegmentedControl
        ariaLabel="Compact period"
        value={value}
        onChange={setValue}
        size="sm"
        items={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
        ]}
      />
    </div>
  );
}

export const TabsStory: Story = { name: 'Tabs', render: () => <TabsExample /> };
export const Segmented: Story = { render: () => <SegmentedExample /> };
export const Menu: Story = {
  render: () => (
    <DropdownMenu
      trigger="Actions"
      ariaLabel="Row actions"
      items={[
        { id: 'edit', label: 'Edit', onSelect: () => {} },
        { id: 'duplicate', label: 'Duplicate', onSelect: () => {} },
        { type: 'separator' },
        { id: 'delete', label: 'Delete', danger: true, onSelect: () => {} },
        { id: 'disabled', label: 'Disabled', disabled: true },
      ]}
    />
  ),
};
