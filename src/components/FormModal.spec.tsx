import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormModal from './FormModal';

describe('FormModal', () => {
  it('renders the form, error and submits through the footer', async () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    render(
      <FormModal
        open
        title="New event"
        onClose={onClose}
        onSubmit={onSubmit}
        error="Name is required"
      >
        <label>
          Name
          <input aria-label="Event name" />
        </label>
      </FormModal>,
    );

    expect(screen.getByRole('dialog', { name: 'New event' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Name is required');

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows a busy label and disables the actions while saving', () => {
    render(
      <FormModal open title="Saving" onClose={vi.fn()} onSubmit={vi.fn()} busy busyLabel="Saving…">
        <input aria-label="Field" />
      </FormModal>,
    );
    expect(screen.getByRole('button', { name: /Saving…/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  it('renders only the cancel action when there is no submit handler', () => {
    render(
      <FormModal open title="Details" onClose={vi.fn()}>
        <span>Body</span>
      </FormModal>,
    );
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });
});
