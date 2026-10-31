import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';
import Item from './Item';

const meta: Meta<typeof Item> = {
  title: 'Item',
  component: Item,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Item>;

const FREIREN = {
  src: 'https://placehold.co/300x450/png',
  initials: 'FR',
  alt: 'Sousou no Frieren cover',
};

export const ListRow: Story = {
  args: {
    title: 'Sousou no Frieren',
    subtitle: 'Madhouse',
    meta: '2023 · 28 episodes',
    media: FREIREN,
    href: '/series/frieren',
    actions: (
      <Button size="sm" variant="secondary">
        Monitor
      </Button>
    ),
  },
};

export const GridCell: Story = {
  args: {
    title: 'Vinland Saga',
    subtitle: 'Wit Studio',
    meta: '2019 · 48 episodes',
    media: { src: null, initials: 'VS', fallback: 'initials' },
    mediaPosition: 'top',
    href: '/series/vinland-saga',
  },
  render: (args) => (
    <div style={{ width: 200 }}>
      <Item {...args} />
    </div>
  ),
};

export const TextOnly: Story = {
  args: {
    title: 'Chainsaw Man',
    subtitle: 'MAPPA',
    meta: '2022 · 12 episodes',
    media: { src: null, fallback: 'none' },
    href: '/series/chainsaw-man',
  },
};

export const WithFooter: Story = {
  args: {
    ...ListRow.args,
    selected: true,
    footer: (
      <>
        <Button size="sm" variant="ghost">
          Details
        </Button>
        <Button size="sm">Open</Button>
      </>
    ),
  },
};

export const Sizes: Story = {
  render: () => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 420 }}
    >
      <Item size="sm" title="Small item" subtitle="12px title / 10px padding" media={FREIREN} />
      <Item size="md" title="Medium item" subtitle="14px title / 12px padding" media={FREIREN} />
      <Item size="lg" title="Large item" subtitle="16px title / 16px padding" media={FREIREN} />
    </div>
  ),
};

export const Loading: Story = {
  args: {
    ...ListRow.args,
    loading: true,
  },
};
