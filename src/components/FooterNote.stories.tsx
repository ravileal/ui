import type { Meta, StoryObj } from '@storybook/react';
import FooterNote from './FooterNote';
import { Card, CardBody } from './Card';

const meta = {
  title: 'Components/FooterNote',
  component: FooterNote,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FooterNote>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'event-hub — built for the home LAN' },
};

export const WithMeta: Story = {
  args: {
    children: 'event-hub — built for the home LAN',
    meta: (
      <>
        <span>v1.7.0</span>
        <a href="#docs">Docs</a>
        <a href="#status">Status</a>
      </>
    ),
  },
};

/** The page it closes: the note sits under the last card, never beside it. */
export const ClosingAPage: Story = {
  render: (args) => (
    <>
      <Card>
        <CardBody>Two jobs ran in the last hour, both green.</CardBody>
      </Card>
      <FooterNote {...args} />
    </>
  ),
  args: {
    children: 'event-hub — built for the home LAN',
    meta: 'v1.7.0 · SQLite',
  },
};
