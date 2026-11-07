import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import StatusDot from './StatusDot';

const meta: Meta = {
  title: 'Components/StatusDot',
  component: StatusDot,
};
export default meta;

type Story = StoryObj;

const row: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
};

const caption: CSSProperties = { fontSize: 12, color: 'var(--ui-text-2)' };

export const Tones: Story = {
  render: () => (
    <div style={row}>
      <span style={row}>
        <StatusDot />
        <span style={caption}>neutral</span>
      </span>
      <span style={row}>
        <StatusDot tone="info" />
        <span style={caption}>info</span>
      </span>
      <span style={row}>
        <StatusDot tone="success" />
        <span style={caption}>success</span>
      </span>
      <span style={row}>
        <StatusDot tone="warning" />
        <span style={caption}>warning</span>
      </span>
      <span style={row}>
        <StatusDot tone="danger" />
        <span style={caption}>danger</span>
      </span>
      <span style={row}>
        <StatusDot tone="accent" />
        <span style={caption}>accent</span>
      </span>
      <span style={row}>
        <StatusDot tone="purple" />
        <span style={caption}>purple</span>
      </span>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ ...row, gap: 20 }}>
      <span style={row}>
        <StatusDot size="sm" tone="info" />
        <span style={caption}>sm · 6px</span>
      </span>
      <span style={row}>
        <StatusDot size="md" tone="info" />
        <span style={caption}>md · 9px</span>
      </span>
      <span style={row}>
        <StatusDot size="lg" tone="info" />
        <span style={caption}>lg · 12px</span>
      </span>
    </div>
  ),
};

export const Halo: Story = {
  render: () => (
    <div style={{ ...row, gap: 20 }}>
      <span style={row}>
        <StatusDot tone="success" halo />
        <span style={caption}>Running</span>
      </span>
      <span style={row}>
        <StatusDot tone="warning" halo size="lg" />
        <span style={caption}>Degraded</span>
      </span>
      <span style={row}>
        <StatusDot tone="danger" halo size="sm" />
        <span style={caption}>Down</span>
      </span>
    </div>
  ),
};

export const Pulse: Story = {
  render: () => (
    <div style={{ ...row, gap: 20 }}>
      <span style={row}>
        <StatusDot tone="info" pulse halo />
        <span style={caption}>Sync in progress</span>
      </span>
      <span style={row}>
        <StatusDot tone="success" pulse />
        <span style={caption}>Streaming</span>
      </span>
      <span style={row}>
        <StatusDot tone="danger" pulse halo size="lg" />
        <span style={caption}>Retrying</span>
      </span>
    </div>
  ),
};
