import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NumberField, { type NumberFieldProps } from './NumberField';

function Controlled(props: NumberFieldProps) {
  const [value, setValue] = useState(props.value);
  return (
    <NumberField
      {...props}
      value={value}
      onChange={(next) => {
        props.onChange(next);
        setValue(next);
      }}
    />
  );
}

describe('NumberField', () => {
  it('takes its accessible name from the label', () => {
    render(<NumberField label="Threshold" value={5} onChange={() => {}} />);
    const input = screen.getByLabelText('Threshold') as HTMLInputElement;
    // A native number input sanitises the draft, which makes the leading minus
    // untypeable; the field is a text input with a decimal keypad instead.
    expect(input.type).toBe('text');
    expect(input.inputMode).toBe('decimal');
    expect(input.value).toBe('5');
  });

  it('keeps the label association when the label is hidden', () => {
    render(<NumberField label="Threshold" value={5} onChange={() => {}} labelHidden />);
    const input = screen.getByLabelText('Threshold') as HTMLInputElement;
    expect(input.value).toBe('5');
    expect(screen.getByText('Threshold').className).toBe(
      'ui-number-field-label ui-visually-hidden',
    );
  });

  it('calls onChange with the parsed number while typing', async () => {
    const onChange = vi.fn();
    render(<NumberField label="Threshold" value={5} onChange={onChange} />);
    const input = screen.getByLabelText('Threshold');

    await userEvent.clear(input);
    await userEvent.type(input, '42');

    expect(onChange).toHaveBeenLastCalledWith(42);
  });

  it('clamps above max and below min on blur', async () => {
    const onChange = vi.fn();
    const { unmount } = render(<Controlled label="High" value={0} max={10} onChange={onChange} />);
    const high = screen.getByLabelText('High') as HTMLInputElement;
    await userEvent.clear(high);
    await userEvent.type(high, '99');
    await userEvent.tab();

    expect(onChange).toHaveBeenLastCalledWith(10);
    expect(high.value).toBe('10');
    unmount();

    const lowChange = vi.fn();
    render(<Controlled label="Low" value={50} min={10} onChange={lowChange} />);
    const low = screen.getByLabelText('Low') as HTMLInputElement;
    await userEvent.clear(low);
    await userEvent.type(low, '5');
    await userEvent.tab();

    expect(lowChange).toHaveBeenLastCalledWith(10);
    expect(low.value).toBe('10');
  });

  it('accepts a negative value typed from the minus sign', async () => {
    const onChange = vi.fn();
    render(<Controlled label="Weight" value={0} min={-100} max={100} onChange={onChange} />);
    const input = screen.getByLabelText('Weight') as HTMLInputElement;

    await userEvent.clear(input);
    await userEvent.type(input, '-42');

    expect(onChange).toHaveBeenLastCalledWith(-42);
    expect(input.value).toBe('-42');
  });

  it('steps with the arrow keys and stays inside the bounds', async () => {
    const onChange = vi.fn();
    render(<Controlled label="Weight" value={99} min={-100} max={100} onChange={onChange} />);
    const input = screen.getByLabelText('Weight') as HTMLInputElement;

    input.focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith(100);
    await userEvent.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith(100);
    await userEvent.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith(99);
  });

  it('restores the last value when the field is left empty', async () => {
    const onChange = vi.fn();
    render(<Controlled label="Threshold" value={7} onChange={onChange} />);
    const input = screen.getByLabelText('Threshold') as HTMLInputElement;

    await userEvent.clear(input);
    await userEvent.tab();

    expect(input.value).toBe('7');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('blocks edits while disabled', async () => {
    const onChange = vi.fn();
    render(<NumberField label="Threshold" value={7} onChange={onChange} disabled />);
    const input = screen.getByLabelText('Threshold') as HTMLInputElement;

    expect(input.disabled).toBe(true);
    await userEvent.type(input, '9');

    expect(input.value).toBe('7');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('puts the control in the number-field wrapper with the given width', () => {
    const { container } = render(
      <NumberField label="Threshold" value={5} onChange={() => {}} width={88} />,
    );
    const control = container.querySelector('.ui-number-field-control') as HTMLElement;

    expect(container.querySelector('.ui-number-field')).toBeTruthy();
    expect(control.className).toContain('ui-input-wrap');
    expect(control.className).toContain('ui-input-wrap--sm');
    expect(control.style.width).toBe('88px');
  });
});
