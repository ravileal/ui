import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MonthSelector from './MonthSelector';

const MONTHS_FIXTURE = [
  { value: '2026-10', label: 'Oct 2026' },
  { value: '2026-09', label: 'Sep 2026' },
  { value: '2026-08', label: 'Aug 2026' },
];
const ALL = { value: 'All', label: 'All Months' };

function renderStepper(value: string, onChange = vi.fn()) {
  render(
    <MonthSelector
      selectedMonth={value}
      setSelectedMonth={onChange}
      options={MONTHS_FIXTURE}
      allOption={ALL}
      ariaLabel="Filter month"
    />,
  );
  return onChange;
}

describe('MonthSelector stepper', () => {
  it('shows the selected month and steps to older/newer months', async () => {
    const onChange = renderStepper('2026-09');
    expect(screen.getByText('Sep 2026')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(onChange).toHaveBeenLastCalledWith('2026-08');

    await userEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(onChange).toHaveBeenLastCalledWith('2026-10');
  });

  it('disables the arrows at the bounds of the month list', async () => {
    const onChange = renderStepper('2026-10');
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(onChange).not.toHaveBeenCalled();

    render(
      <MonthSelector
        selectedMonth="2026-08"
        setSelectedMonth={onChange}
        options={MONTHS_FIXTURE}
        allOption={ALL}
        ariaLabel="Filter month"
      />,
    );
    const prevButtons = screen.getAllByRole('button', { name: 'Previous month' });
    expect(prevButtons[prevButtons.length - 1]).toBeDisabled();
  });

  it('shows "All Months" with both arrows disabled while it is selected', () => {
    renderStepper('All');
    expect(screen.getByText('All Months')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled();
  });

  it('opens the month dropdown when the label is clicked and commits the pick', async () => {
    const onChange = renderStepper('All');

    await userEvent.click(screen.getByLabelText('Filter month'));
    const list = screen.getByRole('listbox', { name: 'Filter month' });
    expect(list).toHaveTextContent('All Months');
    expect(list).toHaveTextContent('Oct 2026');
    expect(list).toHaveTextContent('Sep 2026');

    await userEvent.click(screen.getByRole('option', { name: 'Sep 2026' }));
    expect(onChange).toHaveBeenCalledWith('2026-09');
    expect(screen.queryByRole('listbox', { name: 'Filter month' })).not.toBeInTheDocument();
  });

  it('supports custom previous/next labels', () => {
    render(
      <MonthSelector
        selectedMonth="2026-09"
        setSelectedMonth={vi.fn()}
        options={MONTHS_FIXTURE}
        previousLabel="Mês anterior"
        nextLabel="Próximo mês"
      />,
    );
    expect(screen.getByRole('button', { name: 'Mês anterior' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeInTheDocument();
  });
});
