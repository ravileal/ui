import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';
import { Card, CardBody, CardFooter, CardHeader } from './Card';

const meta: Meta = {
  title: 'Card States',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

function PanelCard({ children }: { children: ReactNode }) {
  return (
    <Card style={{ width: 280 }}>
      <CardHeader title="Panel card" subtitle="Plain card: never moves" />
      <CardBody>{children}</CardBody>
    </Card>
  );
}

export const Plain: Story = {
  render: () => <PanelCard>Static content, no hover lift, no press-in.</PanelCard>,
};

export const Interactive: Story = {
  render: () => (
    <Card interactive style={{ width: 280 }}>
      <CardHeader title="Interactive card" subtitle="Hover me, then press me" />
      <CardBody>Focus the button below to see the focus ring.</CardBody>
      <CardFooter>
        <Button size="sm">Open</Button>
      </CardFooter>
    </Card>
  ),
};

export const Selected: Story = {
  render: () => (
    <Card selected style={{ width: 280 }}>
      <CardHeader title="Selected card" subtitle="Accent border plus inset ring" />
      <CardBody>The selection is independent from interactivity.</CardBody>
    </Card>
  ),
};

export const Loading: Story = {
  render: () => (
    <Card loading style={{ width: 280 }}>
      <CardHeader title="Loading card" subtitle="Keeps the real height" />
      <CardBody>This text is in the DOM but invisible.</CardBody>
      <CardFooter>
        <Button size="sm">Disabled while loading</Button>
      </CardFooter>
    </Card>
  ),
};

function CombinedCard() {
  const [selected, setSelected] = useState(true);
  return (
    <Card interactive selected={selected} style={{ width: 280 }}>
      <CardHeader title="Interactive + selected" subtitle="Hover lift with the accent ring" />
      <CardBody>Hover lift, press-in and the accent ring together.</CardBody>
      <CardFooter>
        <Button size="sm" onClick={() => setSelected((value) => !value)}>
          Toggle selection
        </Button>
      </CardFooter>
    </Card>
  );
}

export const Combined: Story = {
  render: () => <CombinedCard />,
};
