import type { Meta, StoryObj } from '@storybook/react';
import FreshnessStamp from './FreshnessStamp';

const meta = {
  title: 'Components/FreshnessStamp',
  component: FreshnessStamp,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof FreshnessStamp>;
export default meta;

type Story = StoryObj<typeof meta>;

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** The header case from the dashboard: age on top, uptime underneath. */
export const Default: Story = {
  args: {
    updatedAt: new Date(Date.now() - 12_000),
    startedAt: new Date(Date.now() - (3 * HOUR + 12 * MINUTE)),
  },
};

/** A frozen clock renders a fixed reading — the shape a snapshot asserts. */
export const FrozenClock: Story = {
  args: {
    updatedAt: '2024-05-01T11:59:48Z',
    startedAt: '2024-04-29T07:48:00Z',
    now: Date.parse('2024-05-01T12:00:00Z'),
  },
};

/** Nothing read yet: the first line says so instead of counting from zero. */
export const Loading: Story = {
  args: {
    updatedAt: null,
    startedAt: new Date(Date.now() - 2 * DAY),
  },
};

/** The labels are the only words the component owns, so they are overridable. */
export const CustomLabels: Story = {
  args: {
    updatedAt: new Date(Date.now() - 3 * MINUTE),
    startedAt: new Date(Date.now() - 45 * MINUTE),
    labels: { updated: 'synced', up: 'running', loading: 'waiting…' },
  },
};
