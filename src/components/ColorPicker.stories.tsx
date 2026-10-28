import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ColorPicker, type ColorPickerProps } from './ColorPicker';

function StatefulColorPicker(args: ColorPickerProps) {
  const [value, setValue] = useState(args.value);
  return <ColorPicker {...args} value={value} onChange={setValue} />;
}

const meta: Meta<typeof ColorPicker> = {
  title: 'ColorPicker',
  component: ColorPicker,
  args: {
    presets: ['#00c9a7', '#4f7cff', '#f59e0b', '#a855f7', '#f87171', '#8098b5'],
  },
};
export default meta;

type Story = StoryObj<typeof ColorPicker>;

export const Default: Story = {
  render: (args) => <StatefulColorPicker {...args} />,
  args: {
    value: '#00c9a7',
    ariaLabel: 'Color',
  },
};
