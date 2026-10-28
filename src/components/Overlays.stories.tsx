import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ConfirmModal from './ConfirmModal';
import CopyValue from './CopyValue';
import Modal from './Modal';
import Tooltip from './Tooltip';

function ModalExample() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open modal
      </button>
      <Modal open={open} title="Settings" onClose={() => setOpen(false)}>
        <p>Modal content stays in the caller.</p>
      </Modal>
    </>
  );
}

function ConfirmModalExample() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open confirmation
      </button>
      <ConfirmModal
        open={open}
        danger
        title="Delete transaction?"
        message="This action cannot be undone."
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

const meta: Meta = {
  title: 'Overlays',
};
export default meta;

type Story = StoryObj;

export const ModalStory: Story = {
  name: 'Modal',
  render: () => <ModalExample />,
};

export const ConfirmModalStory: Story = {
  name: 'ConfirmModal',
  render: () => <ConfirmModalExample />,
};

export const TooltipStory: Story = {
  name: 'Tooltip',
  render: () => (
    <Tooltip content="Raw merchant name" delay={0}>
      <span>Friendly merchant</span>
    </Tooltip>
  ),
};

export const CopyValueStory: Story = {
  name: 'CopyValue',
  render: () => (
    <CopyValue
      value={1234.5}
      ariaLabel="Copy total"
      formatValue={(value) => `$${Number(value).toFixed(2)}`}
      copyValue={(value) => Number(value).toFixed(2)}
    />
  ),
};
