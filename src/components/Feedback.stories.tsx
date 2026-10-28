import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Badge, Chip } from './Badge';
import Alert from './Alert';
import Button from './Button';
import EmptyState from './EmptyState';
import { ToastProvider, useToast } from './Toast';

const meta: Meta = {
  title: 'Feedback',
};
export default meta;

type Story = StoryObj;

export const Alerts: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 10, width: 460 }}>
      <Alert tone="info" title="Heads up">
        This is an informational message.
      </Alert>
      <Alert tone="success" title="Saved">
        Your changes were saved.
      </Alert>
      <Alert tone="warning" title="Check the split">
        The split ratio differs from the default.
      </Alert>
      <Alert tone="danger" title="Import failed" onDismiss={() => {}}>
        The invoice could not be parsed.
      </Alert>
    </div>
  ),
};

function ChipsExample() {
  const [patterns, setPatterns] = useState(['UBER', '99*', 'IFOOD']);
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {patterns.map((pattern) => (
        <Chip
          key={pattern}
          tone="info"
          onRemove={() => setPatterns((current) => current.filter((item) => item !== pattern))}
        >
          {pattern}
        </Chip>
      ))}
    </div>
  );
}

export const Badges: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Badge>Neutral</Badge>
        <Badge tone="info">Info</Badge>
        <Badge tone="success" dot>
          Paid
        </Badge>
        <Badge tone="warning">Pending</Badge>
        <Badge tone="danger">Overdue</Badge>
        <Badge tone="accent">New</Badge>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Badge variant="solid" tone="success">
          Solid
        </Badge>
        <Badge variant="outline" tone="info">
          Outline
        </Badge>
      </div>
      <ChipsExample />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <EmptyState
        icon={<span>+</span>}
        title="No aliases yet"
        description="Create an alias to turn noisy merchant descriptions into readable names."
        action={<Button size="sm">New alias</Button>}
      />
    </div>
  ),
};

function ToastDemo() {
  const { showToast } = useToast();
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button
        size="sm"
        onClick={() =>
          showToast({ title: 'Saved', description: 'Your changes were saved.', tone: 'success' })
        }
      >
        Success toast
      </Button>
      <Button
        size="sm"
        variant="danger"
        onClick={() =>
          showToast({ title: 'Import failed', description: 'Try again later.', tone: 'danger' })
        }
      >
        Error toast
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          showToast({ title: 'Sticky', description: 'Dismiss me manually.', duration: 0 })
        }
      >
        Sticky toast
      </Button>
    </div>
  );
}

export const Toasts: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};
