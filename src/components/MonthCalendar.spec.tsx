import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MonthCalendar from './MonthCalendar';

const EVENT = {
  id: 'e1',
  name: 'Trip',
  startDate: '2026-05-01',
  endDate: '2026-05-04',
};

describe('MonthCalendar', () => {
  it('renders the month grid and event chips in view mode', () => {
    render(<MonthCalendar mode="view" events={[EVENT]} initialMonth="2026-05" />);

    expect(screen.getByText('May 2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2026-05-01' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Trip' })).toHaveLength(4);
  });

  it('opens a day and an event through the callbacks', async () => {
    const onDayClick = vi.fn();
    const onEventClick = vi.fn();
    render(
      <MonthCalendar
        mode="view"
        events={[EVENT]}
        initialMonth="2026-05"
        onDayClick={onDayClick}
        onEventClick={onEventClick}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: '2026-05-02' }));
    expect(onDayClick).toHaveBeenCalledWith('2026-05-02');

    await userEvent.click(screen.getAllByRole('button', { name: 'Trip' })[0]);
    expect(onEventClick).toHaveBeenCalledWith(EVENT);
    expect(onDayClick).toHaveBeenCalledTimes(1);
  });

  it('selects a range with two day clicks', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MonthCalendar
        mode="range"
        startDate=""
        endDate=""
        initialMonth="2026-05"
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: '2026-05-10' }));
    expect(onChange).toHaveBeenLastCalledWith({
      startDate: '2026-05-10',
      endDate: '2026-05-10',
    });

    rerender(
      <MonthCalendar
        mode="range"
        startDate="2026-05-10"
        endDate="2026-05-10"
        initialMonth="2026-05"
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: '2026-05-14' }));
    expect(onChange).toHaveBeenLastCalledWith({
      startDate: '2026-05-10',
      endDate: '2026-05-14',
    });
  });

  it('marks the range and clears it from the footer', async () => {
    const onChange = vi.fn();
    const { container } = render(
      <MonthCalendar
        mode="range"
        startDate="2026-05-10"
        endDate="2026-05-14"
        initialMonth="2026-05"
        onChange={onChange}
        formatRange={(start, end) => `${start} → ${end}`}
      />,
    );

    expect(
      within(screen.getByRole('button', { name: '2026-05-10' })).getByText('10'),
    ).toBeInTheDocument();
    expect(screen.getByText('2026-05-10 → 2026-05-14')).toBeInTheDocument();
    expect(container.querySelector('.is-range-start')).toBeInTheDocument();
    expect(container.querySelector('.is-range-end')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onChange).toHaveBeenCalledWith({ startDate: '', endDate: '' });
  });

  it('previews the pending range on hover while awaiting the end date', async () => {
    const { container } = render(
      <MonthCalendar
        mode="range"
        startDate="2026-05-10"
        endDate="2026-05-10"
        initialMonth="2026-05"
        onChange={() => {}}
        formatRange={(start, end) => `${start} → ${end}`}
      />,
    );

    expect(screen.getByText('2026-05-10 → 2026-05-10')).toBeInTheDocument();

    await userEvent.hover(screen.getByRole('button', { name: '2026-05-14' }));
    expect(screen.getByText('2026-05-10 → 2026-05-14')).toBeInTheDocument();
    expect(container.querySelectorAll('.is-preview')).toHaveLength(4);
    expect(screen.getByRole('button', { name: '2026-05-14' })).toHaveClass('is-preview-end');

    await userEvent.unhover(screen.getByRole('button', { name: '2026-05-14' }));
    expect(screen.getByText('2026-05-10 → 2026-05-10')).toBeInTheDocument();
    expect(container.querySelectorAll('.is-preview')).toHaveLength(0);
  });
});
