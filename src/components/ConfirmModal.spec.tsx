import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmModal from './ConfirmModal';

describe('ConfirmModal', () => {
  it('renders the message and confirms', async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmModal
        open
        title="Delete transaction?"
        message="This cannot be undone."
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog')).toHaveTextContent('Delete transaction?');
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('uses the danger label and custom labels', async () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal
        open
        danger
        title="Remove?"
        message="Remove it."
        onConfirm={vi.fn()}
        onCancel={onCancel}
        confirmLabel="Remove"
        cancelLabel="Keep"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
    await userEvent.click(screen.getByRole('button', { name: 'Keep' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('closes from the shared modal close button', async () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal
        open
        title="Confirm"
        message="Message"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
