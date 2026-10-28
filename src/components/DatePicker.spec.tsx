import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DatePicker from './DatePicker';

function todayISO(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

describe('DatePicker', () => {
  it('shows the formatted value in the trigger', () => {
    render(<DatePicker value="2026-03-30" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Date')).toHaveTextContent('Mar 30, 2026');
  });

  it('shows the placeholder when empty', () => {
    render(<DatePicker value="" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Date')).toHaveTextContent('Select date');
  });

  it('renders the compact format when requested', () => {
    render(<DatePicker value="2026-03-30" onChange={vi.fn()} format="short" />);
    expect(screen.getByLabelText('Date')).toHaveTextContent('03/30/2026');
  });

  it('opens the calendar dialog for the value month', async () => {
    render(<DatePicker value="2026-03-30" onChange={vi.fn()} />);
    await userEvent.click(screen.getByLabelText('Date'));
    const dialog = screen.getByRole('dialog', { name: 'Date' });
    expect(within(dialog).getByText('March 2026')).toBeInTheDocument();
  });

  it('picks a day and closes', async () => {
    const onChange = vi.fn();
    render(<DatePicker value="2026-03-30" onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Date'));
    await userEvent.click(screen.getByRole('button', { name: '15' }));
    expect(onChange).toHaveBeenCalledWith('2026-03-15');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('navigates months', async () => {
    render(<DatePicker value="2026-03-30" onChange={vi.fn()} />);
    await userEvent.click(screen.getByLabelText('Date'));
    await userEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByText('April 2026')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    await userEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(screen.getByText('February 2026')).toBeInTheDocument();
  });

  it('clears the value', async () => {
    const onChange = vi.fn();
    render(<DatePicker value="2026-03-30" onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Date'));
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('selects today', async () => {
    const onChange = vi.fn();
    render(<DatePicker value="2026-03-30" onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Date'));
    await userEvent.click(screen.getByRole('button', { name: 'Today' }));
    expect(onChange).toHaveBeenCalledWith(todayISO());
  });

  it('closes on Escape', async () => {
    render(<DatePicker value="2026-03-30" onChange={vi.fn()} />);
    await userEvent.click(screen.getByLabelText('Date'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not open when disabled', async () => {
    render(<DatePicker value="2026-03-30" onChange={vi.fn()} disabled />);
    await userEvent.click(screen.getByLabelText('Date'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('formats and labels the calendar for another locale', async () => {
    render(
      <DatePicker
        value="2026-03-30"
        onChange={vi.fn()}
        locale="pt-BR"
        ariaLabel="Data"
        previousMonthLabel="Mês anterior"
        nextMonthLabel="Próximo mês"
        clearLabel="Limpar"
        todayLabel="Hoje"
      />,
    );

    expect(screen.getByLabelText('Data')).toHaveTextContent(/2026/);
    await userEvent.click(screen.getByLabelText('Data'));

    expect(screen.getByText('março de 2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mês anterior' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Limpar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hoje' })).toBeInTheDocument();
  });
});
