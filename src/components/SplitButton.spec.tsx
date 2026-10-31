import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SplitButton from './SplitButton';

function renderSplitButton({
  onPrimary = vi.fn(),
  onManual = vi.fn(),
  disabled = false,
}: {
  onPrimary?: () => void;
  onManual?: () => void;
  disabled?: boolean;
} = {}) {
  render(
    <SplitButton
      label="Add"
      leadingIcon={<span aria-hidden="true">+</span>}
      onPrimary={onPrimary}
      ariaLabel="More add options"
      disabled={disabled}
      items={[{ id: 'manual', label: 'Add manually', onSelect: onManual }]}
    />,
  );
  return { onPrimary, onManual };
}

describe('SplitButton', () => {
  it('runs the primary action and the caret menu action', async () => {
    const { onPrimary, onManual } = renderSplitButton();

    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onPrimary).toHaveBeenCalledTimes(1);

    const trigger = screen.getByRole('button', { name: 'More add options' });
    expect(trigger).toHaveClass('ui-split-button-caret');
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Add manually' }));

    expect(onManual).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menuitem', { name: 'Add manually' })).not.toBeInTheDocument();
  });

  it('keeps the menu closed while disabled', async () => {
    renderSplitButton({ disabled: true });

    const trigger = screen.getByRole('button', { name: 'More add options' });
    expect(trigger).toBeDisabled();
    await userEvent.click(trigger);

    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });

  it('renders the opened menu inside the split button so it stays attached', async () => {
    render(
      <SplitButton
        label="Add"
        onPrimary={vi.fn()}
        ariaLabel="More add options"
        items={[
          { id: 'manual', label: 'Add manually' },
          { id: 'template', label: 'Add from template' },
        ]}
      />,
    );

    const trigger = screen.getByRole('button', { name: 'More add options' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('ui-menu-list');
    // The list must live inside the split button and inside the caret's
    // .ui-menu wrapper: that nesting is what the flush-menu CSS targets.
    expect(menu.closest('.ui-split-button')).not.toBeNull();
    expect(menu.closest('.ui-menu')).toBe(trigger.parentElement);
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
  });
});
