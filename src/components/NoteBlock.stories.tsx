import type { Meta, StoryObj } from '@storybook/react';
import NoteBlock from './NoteBlock';

const meta: Meta = {
  title: 'Components/NoteBlock',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

/** The footer of a detail sheet: prose, then the raw values behind it. */
export const WithDetails: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <NoteBlock
        title="Last run"
        lines={[
          { label: 'Webhook target', value: 'https://hooks.example.com/inbound/2f9a1c' },
          { label: 'Probe detail', value: 'HTTP 200 in 184 ms' },
          { label: 'Last error', value: 'ECONNRESET', tone: 'danger' },
        ]}
      >
        The delivery is retried once before the event is marked as failed. Failures keep the payload
        so a replay sends exactly what was received.
      </NoteBlock>
    </div>
  ),
};

/** A tone carries the state of the note; each line can set its own. */
export const Tones: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, width: 420 }}>
      <NoteBlock tone="success" lines={['HTTP 200 in 184 ms']}>
        The endpoint answered on the first attempt.
      </NoteBlock>
      <NoteBlock tone="warning" lines={['Retry scheduled in 30 s']}>
        The endpoint answered slowly; the delivery is still queued.
      </NoteBlock>
      <NoteBlock tone="danger" lines={[{ label: 'Last error', value: 'ECONNRESET' }]}>
        Three attempts failed, so the event is parked.
      </NoteBlock>
    </div>
  ),
};

/** A note that is itself an output stays in monospace. */
export const MonoNote: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <NoteBlock mono tone="danger" title="Probe output">
        {'fatal: cannot resolve hooks.example.com\nprobe exited 1 after 5000 ms'}
      </NoteBlock>
    </div>
  ),
};

/** Long unbroken values break anywhere instead of widening the sheet. */
export const LongValues: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <NoteBlock
        lines={[
          'https://hooks.example.com/inbound/averylongunbrokenpaththatwouldoverflow/2f9a1c',
          { label: 'Infohash', value: '8f1c2b9d4e5a7c3b1a0f9e8d7c6b5a4f3e2d1c0b' },
        ]}
      >
        Narrow containers are the real test.
      </NoteBlock>
    </div>
  ),
};
