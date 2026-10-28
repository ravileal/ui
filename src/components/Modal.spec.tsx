import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';

describe('Modal', () => {
  it('renders a bordered close button matching the system buttons', () => {
    render(
      <Modal open title="Test modal" onClose={vi.fn()}>
        <div>content</div>
      </Modal>,
    );

    const close = screen.getByRole('button', { name: 'Close' });
    expect(close.style.border).toBe('1px solid var(--ui-border)');
    expect(close.style.background).toBe('var(--ui-surface-2)');
  });

  it('closes when the close button is clicked', async () => {
    const onClose = vi.fn();
    render(
      <Modal open title="Test modal" onClose={onClose}>
        <div>content</div>
      </Modal>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(
      <Modal open title="Test modal" onClose={onClose}>
        <div>content</div>
      </Modal>,
    );

    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
