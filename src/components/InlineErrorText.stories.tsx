import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import InlineErrorText from './InlineErrorText';

const meta: Meta = {
  title: 'Components/InlineErrorText',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => <InlineErrorText>Could not reach the executor</InlineErrorText>,
};

function RetryExample() {
  const [attempts, setAttempts] = useState(0);
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <InlineErrorText onRetry={() => setAttempts((current) => current + 1)}>
        Sync failed — the gateway timed out
      </InlineErrorText>
      <span style={{ fontSize: 11, color: 'var(--ui-text-3)' }}>Retries: {attempts}</span>
    </div>
  );
}

export const WithRetry: Story = {
  render: () => <RetryExample />,
};

export const InContext: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8, width: 360 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 12.5 }}>Nightly import</span>
        <InlineErrorText onRetry={() => {}} retryLabel="Try again">
          Failed at 14:02
        </InlineErrorText>
      </div>
      <InlineErrorText block>Last result: could not parse the response body</InlineErrorText>
    </div>
  ),
};
