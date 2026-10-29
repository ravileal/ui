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
});
