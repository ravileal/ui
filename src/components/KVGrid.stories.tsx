import type { Meta, StoryObj } from '@storybook/react';
import KVGrid, { type KVGridItem } from './KVGrid';

const meta: Meta = {
  title: 'Components/KVGrid',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const DELIVERY: KVGridItem[] = [
  { label: 'State', value: 'Delivered' },
  { label: 'Attempts', value: '3' },
  { label: 'Dispatched', value: '07/11/2026 14:02' },
  { label: 'Latency', value: '184 ms', tone: 'success' },
];

const TARGET: KVGridItem[] = [
  { label: 'Kind', value: 'Webhook' },
  { label: 'Method', value: 'POST' },
  { label: 'Target', value: 'https://hooks.example.com/inbound', mono: true },
  { label: 'Signature', value: 'sha256:8f1c2b9d4e5a', mono: true },
];

const DOWNLOAD: KVGridItem[] = [
  { label: 'Indexer', value: 'Nyaa' },
  { label: 'Release title', value: '[SubsPlease] Frieren - 01 (1080p)' },
  { label: 'Tamanho', value: '1.4 GB' },
  { label: 'Seeders', value: '42' },
  { label: 'Infohash', value: '8f1c2b9d4e5a7c3b1a0f', mono: true },
  { label: 'Estado', value: 'Downloading', tone: 'info' },
];

/** The detail-sheet reading: three 4-row grids, small uppercase key above the value. */
export const Stacked: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
      <KVGrid items={DELIVERY} ariaLabel="Delivery" />
      <KVGrid items={TARGET} ariaLabel="Target" />
      <KVGrid items={DOWNLOAD} ariaLabel="Download" />
    </div>
  ),
};

/** The settings-row reading: key left, value right, hairline between rows. */
export const Inline: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <KVGrid
        items={DOWNLOAD}
        layout="inline"
        divided
        ariaLabel="Download details"
        valueAlign="end"
      />
    </div>
  ),
};

/** Two and three columns of pairs; a long value wraps inside its own column. */
export const Columns: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, width: 640 }}>
      <KVGrid
        items={[
          ...TARGET,
          { label: 'Timeout', value: '5000 ms' },
          { label: 'Retries', value: '1' },
        ]}
        columns={2}
        ariaLabel="Two columns"
      />
      <KVGrid
        items={[
          { label: 'Last error', value: 'ECONNRESET: socket hang up after 5000 ms' },
          { label: 'Queue', value: '0' },
          { label: 'Dropped', value: '0' },
          { label: 'Paused', value: 'no' },
        ]}
        columns={3}
        ariaLabel="Three columns"
      />
    </div>
  ),
};

/** Missing values become an em dash, or whatever `emptyValue` says. */
export const EmptyValues: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
      <KVGrid
        items={[
          { label: 'Probe', value: undefined },
          { label: 'Last error', value: null },
          { label: 'Next attempt', value: null },
        ]}
        ariaLabel="Defaults"
      />
      <KVGrid
        items={[
          { label: 'Probe', value: undefined },
          { label: 'Last error', value: null },
          { label: 'Next attempt', value: null },
        ]}
        emptyValue="unknown"
        ariaLabel="Custom empty value"
      />
    </div>
  ),
};
