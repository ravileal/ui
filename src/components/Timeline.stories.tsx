import type { Meta, StoryObj } from '@storybook/react';
import { Timeline, type TimelineItem } from './Timeline';

const meta: Meta<typeof Timeline> = {
  title: 'Components/Timeline',
  component: Timeline,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ width: 520 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Timeline>;

/** One traced request: proxy in, hub fan-out, event write, webhook out. */
const TRACE: TimelineItem[] = [
  {
    id: 'proxy',
    source: 'proxy',
    label: 'Proxy in',
    offset: 0,
    ms: 8,
    detail: 'edge → proxy · TLS resumed',
    tone: 'info',
  },
  {
    id: 'auth',
    source: 'hub',
    label: 'Auth check',
    offset: 8,
    ms: 34,
    detail: 'proxy → hub · token cache hit',
  },
  {
    id: 'fanout',
    source: 'hub',
    label: 'Fan-out',
    offset: 42,
    ms: 96,
    detail: 'hub → workers · 3 subscribers',
    tone: 'purple',
  },
  {
    id: 'write',
    source: 'hub',
    label: 'Event write',
    offset: 138,
    ms: 212,
    detail: 'hub → sqlite · 1 row committed',
    tone: 'success',
  },
  {
    id: 'webhook',
    source: 'delivery',
    label: 'Webhook',
    offset: 350,
    ms: 240,
    bad: true,
    detail: 'hub → delivery · FALHA upstream 502',
  },
  {
    id: 'retry',
    source: 'delivery',
    label: 'Retry scheduled',
    offset: 590,
    ms: 46,
    detail: 'delivery → queue · backoff 2 s',
    tone: 'warning',
  },
];

/** Hops that carry no duration: instants, drawn as dots on the track. */
const MARKERS: TimelineItem[] = [
  {
    id: 'queued',
    source: 'proxy',
    label: 'Request queued',
    offset: 0,
    ms: null,
    detail: 'edge → proxy · accepted',
  },
  {
    id: 'claimed',
    source: 'hub',
    label: 'Job claimed',
    offset: 180,
    ms: null,
    detail: 'hub → worker · lock taken',
    tone: 'info',
  },
  {
    id: 'ack',
    source: 'delivery',
    label: 'Delivered',
    offset: 620,
    ms: null,
    detail: 'worker → delivery · 200 OK',
    tone: 'success',
  },
  {
    id: 'timeout',
    source: 'delivery',
    label: 'Receiver timeout',
    offset: 980,
    ms: null,
    bad: true,
    detail: 'worker → delivery · error: socket hang up',
  },
];

export const Waterfall: Story = {
  args: { items: TRACE, ariaLabel: 'Request trace' },
};

export const Markers: Story = {
  name: 'Markers only',
  args: { items: MARKERS, ariaLabel: 'Delivery points' },
};

/** A window narrower than the data: the tail is clamped to the right edge. */
export const NarrowWindow: Story = {
  name: 'Fixed window',
  args: { items: TRACE, windowMs: 400, ariaLabel: 'Request trace, first 400 ms' },
};

export const Empty: Story = {
  args: { items: [], emptyLabel: 'No hops recorded for this trace' },
};
