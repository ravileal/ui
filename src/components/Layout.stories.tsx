import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';
import { Card, CardBody, CardFooter, CardHeader, Section } from './Card';
import PageHeader from './PageHeader';

const meta: Meta = {
  title: 'Layout',
};
export default meta;

type Story = StoryObj;

export const Cards: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, width: 480 }}>
      <Card padding="none">
        <CardHeader
          title="Aliases"
          subtitle="Readable names for merchant descriptions"
          actions={<Button size="sm">New alias</Button>}
        />
        <CardBody>Card body content.</CardBody>
        <CardFooter>
          <Button variant="secondary" size="sm">
            Cancel
          </Button>
          <Button size="sm">Save</Button>
        </CardFooter>
      </Card>
      <Section title="Notifications" subtitle="When to remind you">
        Section body content.
      </Section>
    </div>
  ),
};

export const Header: Story = {
  render: () => (
    <div style={{ width: 640 }}>
      <PageHeader
        title="Transactions"
        subtitle="October 2026"
        actions={<Button size="sm">Export</Button>}
      />
      <PageHeader
        title="Rules"
        subtitle="Automatic categorization"
        onBack={() => {}}
        actions={<Button size="sm">New rule</Button>}
      />
    </div>
  ),
};
