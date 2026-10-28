import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormField from './components/FormField';
import SearchInput from './components/SearchInput';
import Slider from './components/Slider';
import Switch from './components/Switch';
import Textarea from './components/Textarea';
import TextInput from './components/TextInput';

describe('TextInput', () => {
  it('renders, types and marks invalid state', async () => {
    const onChange = vi.fn();
    render(<TextInput aria-label="Name" invalid onChange={onChange} />);
    const input = screen.getByLabelText('Name');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    await userEvent.type(input, 'Ravi');
    expect(onChange).toHaveBeenCalled();
  });

  it('clears through the trailing button', async () => {
    const onClear = vi.fn();
    render(<TextInput aria-label="Search" value="text" onClear={onClear} readOnly />);
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});

describe('Textarea', () => {
  it('accepts text and marks invalid state', () => {
    render(<Textarea aria-label="Notes" invalid defaultValue="hello" />);
    const textarea = screen.getByLabelText('Notes');
    expect(textarea).toHaveValue('hello');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('FormField', () => {
  it('wires the label, hint and error to a cloned control', () => {
    render(
      <FormField label="Name" hint="Your display name" error="Name is required" required>
        <TextInput />
      </FormField>,
    );
    const input = screen.getByLabelText(/Name/);
    const describedBy = input.getAttribute('aria-describedby')!;
    expect(describedBy).toContain('-hint');
    expect(describedBy).toContain('-error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toBeRequired();
    expect(screen.getByRole('alert')).toHaveTextContent('Name is required');
  });

  it('supports a render-prop control', () => {
    render(
      <FormField label="Amount" hint="In BRL">
        {({ id, describedBy }) => (
          <input id={id} aria-describedby={describedBy} aria-label="Amount control" />
        )}
      </FormField>,
    );
    const input = screen.getByLabelText('Amount control');
    expect(input).toHaveAttribute('aria-describedby');
  });
});

describe('Switch', () => {
  it('toggles and exposes switch semantics', async () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} label="Notifications" />);
    const toggle = screen.getByRole('switch', { name: 'Notifications' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('does not toggle when disabled', async () => {
    const onChange = vi.fn();
    render(<Switch checked onChange={onChange} label="Locked" disabled />);
    await userEvent.click(screen.getByRole('switch', { name: 'Locked' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('Slider', () => {
  it('renders the value and reports changes', () => {
    const onChange = vi.fn();
    render(
      <Slider label="Split" value={60} onChange={onChange} formatValue={(value) => `${value}%`} />,
    );
    expect(screen.getByText('60%')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Split'), { target: { value: '75' } });
    expect(onChange).toHaveBeenCalledWith(75);
  });
});

describe('SearchInput', () => {
  it('filters and clears the value', async () => {
    const onChange = vi.fn();
    render(<SearchInput ariaLabel="Search aliases" value="food" onChange={onChange} />);
    const input = screen.getByLabelText('Search aliases');
    expect(input).toHaveValue('food');
    await userEvent.type(input, 's');
    expect(onChange).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(onChange).toHaveBeenCalledWith('');
  });
});
