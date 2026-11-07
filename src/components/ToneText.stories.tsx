import type { Meta, StoryObj } from '@storybook/react';
import type { Tone } from '../internal/tone';
import ToneText from './ToneText';

const meta: Meta = {
  title: 'Components/ToneText',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const TONES: Tone[] = ['neutral', 'info', 'success', 'warning', 'danger', 'accent', 'purple'];

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 10 }}>
      {TONES.map((tone) => (
        <div key={tone} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
          <ToneText tone={tone}>{tone}</ToneText>
          <ToneText tone={tone} weight="medium" size="sm">
            {tone} (small)
          </ToneText>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, width: 320 }}>
      <div>
        <ToneText tone="success">Succeeded</ToneText>
        <ToneText tone="neutral" weight="medium" style={{ marginLeft: 8 }}>
          28 items
        </ToneText>
      </div>
      <div>
        <ToneText tone="danger" size="sm">
          Last run failed at 14:02
        </ToneText>
      </div>
    </div>
  ),
};

export const Tabular: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 6, width: 200 }}>
      {['09:05', '11:40', '14:02', '23:59'].map((time) => (
        <div key={time} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <ToneText tone="neutral" weight="medium" tabular>
            {time}
          </ToneText>
          <ToneText tone="info" size="sm" tabular>
            1.2s
          </ToneText>
        </div>
      ))}
    </div>
  ),
};

export const Elements: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      <ToneText as="strong" tone="danger">
        Failed
      </ToneText>
      <ToneText as="em" tone="warning">
        Degraded
      </ToneText>
      <ToneText as="p" tone="success" size="sm">
        Completed without errors
      </ToneText>
    </div>
  ),
};
