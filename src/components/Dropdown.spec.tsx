import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dropdown from './Dropdown';

const OPTIONS = [
  { value: '', label: '—' },
  { value: 'Groceries', label: 'Groceries', color: '#00c9a7' },
  { value: 'Dining', label: 'Dining', color: '#4f7cff' },
];

describe('Dropdown', () => {
  it('shows the label of the selected value', () => {
    render(<Dropdown ariaLabel="Category" value="Dining" onChange={vi.fn()} options={OPTIONS} />);
    expect(screen.getByLabelText('Category')).toHaveTextContent('Dining');
  });

  it('shows the placeholder when the value matches no option', () => {
    render(
      <Dropdown
        ariaLabel="Category"
        value="missing"
        placeholder="—"
        onChange={vi.fn()}
        options={OPTIONS}
      />,
    );
    expect(screen.getByLabelText('Category')).toHaveTextContent('missing');
  });

  it('opens the listbox with all options on click', async () => {
    render(<Dropdown ariaLabel="Category" value="" onChange={vi.fn()} options={OPTIONS} />);
    await userEvent.click(screen.getByLabelText('Category'));
    const listbox = screen.getByRole('listbox', { name: 'Category' });
    expect(listbox).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(OPTIONS.length);
  });

  it('selects an option, fires onChange and closes', async () => {
    const onChange = vi.fn();
    render(
      <Dropdown ariaLabel="Category" value="Groceries" onChange={onChange} options={OPTIONS} />,
    );
    await userEvent.click(screen.getByLabelText('Category'));
    await userEvent.click(screen.getByRole('option', { name: 'Dining' }));
    expect(onChange).toHaveBeenCalledWith('Dining');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    render(<Dropdown ariaLabel="Category" value="" onChange={vi.fn()} options={OPTIONS} />);
    await userEvent.click(screen.getByLabelText('Category'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes when clicking outside', async () => {
    render(<Dropdown ariaLabel="Category" value="" onChange={vi.fn()} options={OPTIONS} />);
    await userEvent.click(screen.getByLabelText('Category'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await userEvent.click(document.body);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('navigates options with the keyboard and commits with Enter', async () => {
    const onChange = vi.fn();
    render(
      <Dropdown ariaLabel="Category" value="Groceries" onChange={onChange} options={OPTIONS} />,
    );
    const trigger = screen.getByLabelText('Category');
    await userEvent.click(trigger);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith('Dining');
  });

  it('expands an option with nested options before committing', async () => {
    const onChange = vi.fn();
    render(
      <Dropdown
        ariaLabel="Payment"
        value=""
        onChange={onChange}
        options={[
          {
            value: '4899',
            label: 'Itau Signature',
            children: [
              { value: '4899', label: '4899' },
              { value: '5268', label: '5268' },
            ],
          },
        ]}
      />,
    );

    await userEvent.click(screen.getByLabelText('Payment'));
    await userEvent.click(screen.getByRole('option', { name: 'Itau Signature' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('option', { name: '4899' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '5268' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('option', { name: '5268' }));

    expect(onChange).toHaveBeenCalledWith('5268');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('goes back to the parent list from an expanded option', async () => {
    render(
      <Dropdown
        ariaLabel="Payment"
        value=""
        onChange={vi.fn()}
        options={[
          {
            value: '4899',
            label: 'Itau Signature',
            children: [{ value: '5268', label: '5268' }],
          },
          { value: '', label: '—' },
        ]}
      />,
    );

    await userEvent.click(screen.getByLabelText('Payment'));
    await userEvent.click(screen.getByRole('option', { name: 'Itau Signature' }));
    await userEvent.click(screen.getByRole('button', { name: 'Back to Payment' }));

    expect(screen.getByRole('option', { name: 'Itau Signature' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: '5268' })).not.toBeInTheDocument();
  });

  it('collapses an expanded option with Escape before closing the menu', async () => {
    render(
      <Dropdown
        ariaLabel="Payment"
        value=""
        onChange={vi.fn()}
        options={[
          {
            value: '4899',
            label: 'Itau Signature',
            children: [{ value: '5268', label: '5268' }],
          },
        ]}
      />,
    );

    const trigger = screen.getByLabelText('Payment');
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('option', { name: 'Itau Signature' }));
    await userEvent.keyboard('{Escape}');

    expect(screen.getByRole('listbox', { name: 'Payment' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: '5268' })).not.toBeInTheDocument();
  });

  it('does not open when disabled', async () => {
    render(
      <Dropdown ariaLabel="Category" value="" onChange={vi.fn()} options={OPTIONS} disabled />,
    );
    await userEvent.click(screen.getByLabelText('Category'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('applies the md size and inline width modifiers', () => {
    render(
      <Dropdown
        ariaLabel="Category"
        value="Dining"
        onChange={vi.fn()}
        options={OPTIONS}
        size="md"
        fullWidth={false}
      />,
    );
    const trigger = screen.getByLabelText('Category');
    expect(trigger).toHaveClass('ui-dropdown-trigger', 'is-md');
    expect(trigger.parentElement).toHaveClass('ui-dropdown', 'is-inline');
  });
});
