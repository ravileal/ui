import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Drawer } from './components/Drawer';
import { DropdownMenu } from './components/DropdownMenu';
import { ToastProvider, useToast } from './components/Toast';

describe('DropdownMenu', () => {
  const items = [
    { id: 'edit', label: 'Edit', onSelect: vi.fn() },
    { id: 'duplicate', label: 'Duplicate', disabled: true, onSelect: vi.fn() },
    { type: 'separator' as const },
    { id: 'delete', label: 'Delete', danger: true, onSelect: vi.fn() },
  ];

  it('opens, selects an item and closes', async () => {
    const onSelect = vi.fn();
    render(
      <DropdownMenu
        trigger="Actions"
        ariaLabel="Row actions"
        items={[{ id: 'edit', label: 'Edit', onSelect }]}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }));
    expect(screen.getByRole('menu', { name: 'Row actions' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('supports keyboard navigation and Escape', async () => {
    const onSelect = vi.fn();
    render(
      <DropdownMenu
        trigger="Actions"
        ariaLabel="Row actions"
        items={[
          { id: 'edit', label: 'Edit', onSelect },
          { id: 'delete', label: 'Delete', danger: true },
        ]}
      />,
    );
    const trigger = screen.getByRole('button', { name: 'Row actions' });
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('does not select disabled items', async () => {
    render(<DropdownMenu trigger="Actions" ariaLabel="Row actions" items={items} />);
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Duplicate' }));
    expect(items[1]!.onSelect).not.toHaveBeenCalled();
  });
});

describe('Drawer', () => {
  it('renders after mount and closes through the close button', async () => {
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose} title="Filters" footer={<button>Apply</button>}>
        Drawer body
      </Drawer>,
    );

    const dialog = await screen.findByRole('dialog', { name: 'Filters' });
    expect(dialog).toHaveTextContent('Drawer body');
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape and locks body scroll', async () => {
    const onClose = vi.fn();
    const { unmount } = render(
      <Drawer open onClose={onClose} title="Filters">
        Drawer body
      </Drawer>,
    );
    await screen.findByRole('dialog');
    expect(document.body.style.overflow).toBe('hidden');
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('closes when the overlay is clicked', async () => {
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose} title="Filters">
        Drawer body
      </Drawer>,
    );
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(dialog.parentElement!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

function ToastConsumer({ duration = 0 }: { duration?: number }) {
  const { showToast } = useToast();
  return (
    <button
      type="button"
      onClick={() =>
        showToast({ title: 'Saved', description: 'All good', tone: 'success', duration })
      }
    >
      Show toast
    </button>
  );
}

describe('ToastProvider', () => {
  it('shows and dismisses a toast', async () => {
    render(
      <ToastProvider>
        <ToastConsumer />
      </ToastProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Show toast' }));
    expect(await screen.findByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('All good')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    await waitFor(() => expect(screen.queryByText('Saved')).not.toBeInTheDocument());
  });

  it('auto-dismisses after the duration', async () => {
    vi.useFakeTimers();
    try {
      render(
        <ToastProvider>
          <ToastConsumer duration={1000} />
        </ToastProvider>,
      );
      fireEvent.click(screen.getByRole('button', { name: 'Show toast' }));
      expect(screen.getByText('Saved')).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(1100);
      });
      expect(screen.queryByText('Saved')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
