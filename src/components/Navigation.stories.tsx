import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import AppHeader from './AppHeader';
import { Badge } from './Badge';
import Button from './Button';
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

function AppHeaderExample() {
  const [section, setSection] = useState('library');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
      <AppHeader
        brand={<a href="#brand">anime-tracker</a>}
        nav={
          <SegmentedControl
            size="sm"
            ariaLabel="Seções"
            value={section}
            onChange={setSection}
            items={[
              { value: 'library', label: 'Biblioteca' },
              { value: 'queue', label: 'Fila' },
              { value: 'rules', label: 'Regras' },
            ]}
          />
        }
        meta={
          <>
            <Badge tone="neutral" variant="outline">
              Biblioteca: /animes
            </Badge>
            <Badge tone="info" variant="soft">
              Indexadores: nyaa, tokyotosho
            </Badge>
            <Badge tone="neutral" variant="soft">
              v0.0.0
            </Badge>
          </>
        }
        actions={<Button size="sm">Adicionar anime</Button>}
      />
      <p style={{ margin: 0, color: 'var(--ui-text-2)' }}>Seção ativa: {section}</p>
    </div>
  );
}

/**
 * The app header: brand, section switcher, status chips and the primary action
 * on one sticky bar. Narrow the preview to 390px — the switcher drops to its own
 * row and only the chips go away, so the navigation survives.
 */
export const AppHeaderBar: Story = { name: 'App header', render: () => <AppHeaderExample /> };
