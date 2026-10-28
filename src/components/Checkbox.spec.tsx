import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Checkbox from './Checkbox';

describe('Checkbox', () => {
  it('renders an accessible checkbox with the design-system class', () => {
    render(<Checkbox aria-label="Include hidden items" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Include hidden items' });
    expect(checkbox).toHaveClass('ui-checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('reflects the checked state and reports toggles', async () => {
    const onChange = vi.fn();
    render(<Checkbox aria-label="Use aliases" checked onChange={onChange} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Use aliases' });
    expect(checkbox).toBeChecked();
    await userEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('toggles with the keyboard', async () => {
    const onChange = vi.fn();
    render(<Checkbox aria-label="Enabled" onChange={onChange} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Enabled' });
    checkbox.focus();
    await userEvent.keyboard(' ');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(checkbox).toBeChecked();
  });

  it('applies the compact size token', () => {
    render(<Checkbox aria-label="Select row" size="sm" />);
    expect(screen.getByRole('checkbox', { name: 'Select row' })).toHaveClass('is-sm');
  });

  it('supports the indeterminate state', () => {
    const { rerender } = render(<Checkbox aria-label="Partial" indeterminate />);
    const checkbox = screen.getByRole('checkbox', { name: 'Partial' }) as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(true);

    rerender(<Checkbox aria-label="Partial" indeterminate={false} />);
    expect(checkbox.indeterminate).toBe(false);
  });

  it('keeps the native disabled behaviour', async () => {
    const onChange = vi.fn();
    render(<Checkbox aria-label="Locked" disabled onChange={onChange} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Locked' });
    await userEvent.click(checkbox);
    expect(onChange).not.toHaveBeenCalled();
    expect(checkbox).toBeDisabled();
  });
});
