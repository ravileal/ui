import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Select from './Select';

const OPTIONS = [
  { value: 'groceries', label: 'Groceries' },
  { value: 'dining', label: 'Dining' },
  { value: 'travel', label: 'Travel' },
];

function ControlledSelect({
  initialValue = null,
  onChange,
}: {
  initialValue?: string | number | null;
  onChange?: (value: string | number) => void;
}) {
  const [value, setValue] = useState<string | number | null>(initialValue);
  return (
    <Select
      ariaLabel="Category"
      value={value}
      options={OPTIONS}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

describe('Select', () => {
  it('shows the label of the current value', () => {
    render(<Select ariaLabel="Category" value="dining" onChange={vi.fn()} options={OPTIONS} />);
    expect(screen.getByLabelText('Category')).toHaveTextContent('Dining');
  });

  it('shows the placeholder when the value matches no option', () => {
    render(
      <Select
        ariaLabel="Category"
        value="missing"
        placeholder="Pick a category"
        onChange={vi.fn()}
        options={OPTIONS}
      />,
    );
    expect(screen.getByLabelText('Category')).toHaveTextContent('Pick a category');
  });

  it('opens the listbox and sets aria-expanded', async () => {
    render(<Select ariaLabel="Category" value={null} onChange={vi.fn()} options={OPTIONS} />);
    const trigger = screen.getByLabelText('Category');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox', { name: 'Category' })).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(OPTIONS.length);
  });

  it('opens with Enter, Space and ArrowDown', async () => {
    for (const key of ['{Enter}', ' ', '{ArrowDown}']) {
      const { unmount } = render(
        <Select ariaLabel="Category" value={null} onChange={vi.fn()} options={OPTIONS} />,
      );
      const trigger = screen.getByLabelText('Category');
      trigger.focus();
      await userEvent.keyboard(key);
      expect(screen.getByRole('listbox', { name: 'Category' })).toBeInTheDocument();
      unmount();
    }
  });

  it('commits a clicked option, fires onChange and swaps the label', async () => {
    const onChange = vi.fn();
    render(<ControlledSelect initialValue="groceries" onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Category'));
    await userEvent.click(screen.getByRole('option', { name: 'Dining' }));
    expect(onChange).toHaveBeenCalledWith('dining');
    expect(screen.getByLabelText('Category')).toHaveTextContent('Dining');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('moves the active option with ArrowDown and commits it with Enter', async () => {
    const onChange = vi.fn();
    render(<ControlledSelect initialValue="groceries" onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Category'));
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith('dining');
  });

  it('jumps to the first and last option with Home and End', async () => {
    render(<Select ariaLabel="Category" value={null} onChange={vi.fn()} options={OPTIONS} />);
    await userEvent.click(screen.getByLabelText('Category'));
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('option', { name: 'Travel' })).toHaveClass('is-active');
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('option', { name: 'Groceries' })).toHaveClass('is-active');
  });

  it('makes a hovered option active', async () => {
    render(<Select ariaLabel="Category" value={null} onChange={vi.fn()} options={OPTIONS} />);
    await userEvent.click(screen.getByLabelText('Category'));
    await userEvent.hover(screen.getByRole('option', { name: 'Travel' }));
    expect(screen.getByRole('option', { name: 'Travel' })).toHaveClass('is-active');
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    render(<Select ariaLabel="Category" value={null} onChange={vi.fn()} options={OPTIONS} />);
    const trigger = screen.getByLabelText('Category');
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes on Tab without committing', async () => {
    const onChange = vi.fn();
    render(<Select ariaLabel="Category" value={null} onChange={onChange} options={OPTIONS} />);
    await userEvent.click(screen.getByLabelText('Category'));
    await userEvent.keyboard('{ArrowDown}{Tab}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('closes when clicking outside', async () => {
    render(<Select ariaLabel="Category" value={null} onChange={vi.fn()} options={OPTIONS} />);
    await userEvent.click(screen.getByLabelText('Category'));
    await userEvent.click(document.body);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('does not commit a disabled option', async () => {
    const onChange = vi.fn();
    render(
      <Select
        ariaLabel="Category"
        value={null}
        onChange={onChange}
        options={[...OPTIONS, { value: 'locked', label: 'Locked', disabled: true }]}
      />,
    );
    await userEvent.click(screen.getByLabelText('Category'));
    const locked = screen.getByRole('option', { name: 'Locked' });
    expect(locked).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(locked);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox', { name: 'Category' })).toBeInTheDocument();
  });

  it('reflects the committed value through aria-selected', async () => {
    render(<ControlledSelect initialValue="groceries" />);
    await userEvent.click(screen.getByLabelText('Category'));
    expect(screen.getByRole('option', { name: 'Groceries' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.click(screen.getByRole('option', { name: 'Dining' }));
    await userEvent.click(screen.getByLabelText('Category'));
    expect(screen.getByRole('option', { name: 'Dining' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Groceries' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    expect(screen.getByRole('option', { name: 'Dining' })).toHaveClass('is-selected');
  });

  it('round-trips numeric option values as numbers', async () => {
    const onChange = vi.fn();
    render(
      <Select
        ariaLabel="Page size"
        value={10}
        onChange={onChange}
        options={[
          { value: 10, label: '10' },
          { value: 20, label: '20' },
        ]}
      />,
    );
    await userEvent.click(screen.getByLabelText('Page size'));
    await userEvent.click(screen.getByRole('option', { name: '20' }));
    expect(onChange).toHaveBeenCalledWith(20);
    expect(typeof onChange.mock.calls[0][0]).toBe('number');
  });

  it('renders the hidden input only when a name is given', () => {
    const { container, rerender } = render(
      <Select ariaLabel="Category" value="dining" onChange={vi.fn()} options={OPTIONS} />,
    );
    expect(container.querySelector('input[type="hidden"]')).toBeNull();
    rerender(
      <Select
        ariaLabel="Category"
        value="dining"
        name="category"
        onChange={vi.fn()}
        options={OPTIONS}
      />,
    );
    const hidden = container.querySelector('input[type="hidden"]');
    expect(hidden).toHaveAttribute('name', 'category');
    expect(hidden).toHaveValue('dining');
  });

  it('marks the trigger invalid through aria-invalid', () => {
    const { unmount } = render(
      <Select ariaLabel="Category" value={null} onChange={vi.fn()} options={OPTIONS} invalid />,
    );
    expect(screen.getByLabelText('Category')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Category')).toHaveClass('is-invalid');
    unmount();
    render(<Select ariaLabel="Category" value={null} onChange={vi.fn()} options={OPTIONS} />);
    expect(screen.getByLabelText('Category')).not.toHaveAttribute('aria-invalid');
  });

  it('applies the sm size and inline width modifiers', () => {
    render(
      <Select
        ariaLabel="Category"
        value="dining"
        onChange={vi.fn()}
        options={OPTIONS}
        size="sm"
        fullWidth={false}
      />,
    );
    const trigger = screen.getByLabelText('Category');
    expect(trigger).toHaveClass('ui-select-trigger');
    expect(trigger).not.toHaveClass('is-md');
    expect(trigger.parentElement).toHaveClass('ui-select', 'is-inline');
  });

  it('mounts one listbox with every option on the compact size', async () => {
    const options = [
      { value: 10, label: '10' },
      { value: 25, label: '25' },
      { value: 50, label: '50' },
      { value: 100, label: '100' },
    ];
    render(
      <Select ariaLabel="Page size" value={10} onChange={vi.fn()} options={options} size="sm" />,
    );
    await userEvent.click(screen.getByLabelText('Page size'));
    expect(screen.getAllByRole('listbox')).toHaveLength(1);
    expect(screen.getAllByRole('option')).toHaveLength(options.length);
  });

  it('does not open when disabled', async () => {
    render(
      <Select ariaLabel="Category" value={null} onChange={vi.fn()} options={OPTIONS} disabled />,
    );
    await userEvent.click(screen.getByLabelText('Category'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
