import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NumberStepper } from './NumberStepper';

function setup(value = 113) {
  const onChange = vi.fn();
  render(<NumberStepper value={value} onChange={onChange} ariaLabel="Green" />);
  return onChange;
}

describe('NumberStepper', () => {
  it('shows the value without native spinners and accepts typing', async () => {
    const onChange = setup(113);
    const input = screen.getByLabelText('Green') as HTMLInputElement;
    expect(input.value).toBe('113');
    expect(input.type).toBe('text');

    await userEvent.clear(input);
    await userEvent.type(input, '200');
    expect(onChange).toHaveBeenLastCalledWith(200);
  });

  it('increments and decrements with the custom buttons', async () => {
    const onChange = setup(113);
    await userEvent.click(screen.getByRole('button', { name: 'Increase Green' }));
    expect(onChange).toHaveBeenLastCalledWith(114);
    await userEvent.click(screen.getByRole('button', { name: 'Decrease Green' }));
    expect(onChange).toHaveBeenLastCalledWith(113);
  });

  it('steps with the mouse wheel', () => {
    const onChange = setup(113);
    const input = screen.getByLabelText('Green');
    fireEvent.wheel(input, { deltaY: -100 });
    expect(onChange).toHaveBeenLastCalledWith(114);
    fireEvent.wheel(input, { deltaY: 100 });
    expect(onChange).toHaveBeenLastCalledWith(113);
  });

  it('steps with the keyboard arrows', async () => {
    const onChange = setup(113);
    const input = screen.getByLabelText('Green');
    input.focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith(114);
    await userEvent.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith(113);
  });

  it('clamps typed values to the range on blur', async () => {
    const onChange = setup(113);
    const input = screen.getByLabelText('Green') as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, '999');
    await userEvent.tab();

    expect(onChange).toHaveBeenLastCalledWith(255);
    expect(input.value).toBe('255');
  });
});
