import type { Meta, StoryObj } from '@storybook/react';
import Legend from './Legend';
import type { LegendItem } from './Legend';

const meta: Meta = {
  title: 'Components/Legend',
  component: Legend,
};
export default meta;

type Story = StoryObj;

const STATUS: LegendItem[] = [
  { label: 'Delivered', tone: 'success' },
  { label: 'In flight', tone: 'warning' },
  { label: 'Failed', tone: 'danger' },
];

const shell = { width: 420 };

export const Inline: Story = {
  render: () => (
    <div style={shell}>
      <Legend
        items={STATUS}
        note="Dot colour follows the delivery state, not the payment state."
        ariaLabel="Delivery status"
      />
    </div>
  ),
};

export const Stacked: Story = {
  render: () => (
    <div style={shell}>
      <Legend
        items={[...STATUS, { label: 'Queued', tone: 'info' }, { label: 'Unknown' }]}
        orientation="column"
        ariaLabel="Delivery status"
      />
    </div>
  ),
};

export const NoteOnly: Story = {
  render: () => (
    <div style={shell}>
      <Legend
        items={[]}
        note="Rows fade once they are more than thirty days old. Shape carries the meaning; colour only reinforces it."
      />
    </div>
  ),
};
