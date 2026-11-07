import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ConfirmModal from './ConfirmModal';
import CopyValue from './CopyValue';
import { ModalFooter } from './FormModal';
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

function ModalFooterExample() {
  const [open, setOpen] = useState(true);
  const [mode, setMode] = useState<'idle' | 'busy' | 'danger'>('idle');
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open form
      </button>
      <Modal open={open} title="Edit alias" onClose={() => setOpen(false)}>
        <p style={{ marginBottom: 14 }}>
          The footer owns the Cancel/Confirm pair and a slot on the left for extra controls.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['idle', 'busy', 'danger'] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={mode === option}
              onClick={() => setMode(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <ModalFooter
          extra={
            <span style={{ color: 'var(--ui-text-2)', fontSize: 12 }}>Draft saved 2 min ago</span>
          }
          onCancel={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
          confirmLabel={mode === 'danger' ? 'Delete alias' : 'Save'}
          danger={mode === 'danger'}
          busy={mode === 'busy'}
        />
      </Modal>
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

export const ModalFooterStory: Story = {
  name: 'ModalFooter',
  render: () => <ModalFooterExample />,
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
