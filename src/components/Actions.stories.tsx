import type { Meta, StoryObj } from '@storybook/react';
import Button, { IconButton } from './Button';
import SplitButton from './SplitButton';
import ProgressBar from './ProgressBar';
import Spinner from './Spinner';

const meta: Meta = {
  title: 'Actions',
};
export default meta;

type Story = StoryObj;

export const Buttons: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button loading>Loading</Button>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
        <Button leadingIcon={<span>+</span>}>Add item</Button>
        <IconButton aria-label="Settings">
          <span aria-hidden="true">⚙</span>
        </IconButton>
      </div>
    </div>
  ),
};

export const SplitButtons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <SplitButton
        label="Add"
        leadingIcon={<span aria-hidden="true">+</span>}
        onPrimary={() => {}}
        ariaLabel="More add options"
        items={[
          { id: 'manual', label: 'Add manually', icon: <span aria-hidden="true">✎</span> },
        ]}
      />
      <SplitButton
        variant="secondary"
        label="Export"
        onPrimary={() => {}}
        ariaLabel="More export options"
        items={[{ id: 'csv', label: 'Export CSV' }]}
      />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Spinner size={14} />
      <Spinner size={24} label="Loading data" />
      <Spinner size={36} />
    </div>
  ),
};

export const Progress: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, width: 360 }}>
      <ProgressBar value={25} label="Upload 25%" />
      <ProgressBar value={70} label="Upload 70%" />
      <ProgressBar label="Loading invoices" />
    </div>
  ),
};
