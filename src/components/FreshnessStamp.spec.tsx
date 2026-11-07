import { afterEach, describe, it, expect, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import FreshnessStamp, { formatDuration, formatRelative } from './FreshnessStamp';

const NOW = Date.parse('2024-05-01T12:00:00Z');

afterEach(() => {
  vi.useRealTimers();
});

describe('formatDuration', () => {
  it('reads the two most significant units and drops the empty tail', () => {
    expect(formatDuration(0)).toBe('0s');
    expect(formatDuration(45_000)).toBe('45s');
    expect(formatDuration((3 * 3600 + 12 * 60) * 1000)).toBe('3h 12m');
    expect(formatDuration((2 * 86400 + 4 * 3600) * 1000)).toBe('2d 4h');
  });

  it('never prints a zero minor unit', () => {
    expect(formatDuration(60_000)).toBe('1m');
    expect(formatDuration(3 * 3600 * 1000)).toBe('3h');
    expect(formatDuration(2 * 86400 * 1000)).toBe('2d');
  });

  it('clamps nonsense to zero instead of printing NaN', () => {
    expect(formatDuration(-5_000)).toBe('0s');
    expect(formatDuration(Number.NaN)).toBe('0s');
    expect(formatDuration(Number.POSITIVE_INFINITY)).toBe('0s');
  });
});

describe('formatRelative', () => {
  it('counts back from the given clock', () => {
    expect(formatRelative('2024-05-01T11:59:57Z', NOW)).toBe('3s ago');
    expect(formatRelative('2024-05-01T11:58:30Z', NOW)).toBe('1m 30s ago');
    expect(formatRelative('2024-05-01T09:30:00Z', NOW)).toBe('2h 30m ago');
    expect(formatRelative('2024-04-29T12:00:00Z', NOW)).toBe('2d ago');
  });

  it('accepts Date objects and epoch milliseconds', () => {
    expect(formatRelative(new Date('2024-05-01T11:59:57Z'), NOW)).toBe('3s ago');
    expect(formatRelative(NOW - 90_000, NOW)).toBe('1m 30s ago');
  });

  it('collapses a future or instant timestamp to `just now`', () => {
    expect(formatRelative(NOW, NOW)).toBe('just now');
    expect(formatRelative('2024-05-01T12:00:30Z', NOW)).toBe('just now');
  });

  it('returns a dash for input the clock cannot read', () => {
    expect(formatRelative('not-a-date', NOW)).toBe('—');
    expect(formatRelative('', NOW)).toBe('—');
    expect(formatRelative(null, NOW)).toBe('—');
    expect(formatRelative(undefined, NOW)).toBe('—');
    expect(formatRelative(Number.NaN, NOW)).toBe('—');
  });
});

describe('FreshnessStamp', () => {
  it('renders the two lines with the age over the uptime', () => {
    const { container } = render(
      <FreshnessStamp
        updatedAt="2024-05-01T11:59:48Z"
        startedAt="2024-05-01T08:48:00Z"
        now={NOW}
      />,
    );

    expect(container.querySelector('.ui-freshness')?.className).toContain('ui-freshness');

    const lines = container.querySelectorAll('.ui-freshness-line');
    expect(lines).toHaveLength(2);
    expect(lines[0].querySelector('.ui-freshness-label')?.textContent).toBe('updated');
    expect(lines[0].querySelector('time')?.textContent).toBe('12s ago');
    expect(lines[0].querySelector('time')?.getAttribute('datetime')).toBe(
      '2024-05-01T11:59:48.000Z',
    );
    expect(lines[1].className).toContain('ui-freshness-line--uptime');
    expect(lines[1].querySelector('.ui-freshness-label')?.textContent).toBe('up');
    expect(lines[1].querySelector('.ui-freshness-value')?.textContent).toBe('3h 12m');
  });

  it('hides the uptime line when no start is given', () => {
    const { container } = render(<FreshnessStamp updatedAt="2024-05-01T11:59:48Z" now={NOW} />);

    expect(container.querySelectorAll('.ui-freshness-line')).toHaveLength(1);
    expect(container.querySelector('.ui-freshness-line--uptime')).toBeNull();
    expect(container.querySelectorAll('.ui-freshness-label')).toHaveLength(1);
  });

  it('shows the loading label while nothing has been read yet', () => {
    const { container } = render(<FreshnessStamp updatedAt={null} now={NOW} />);

    expect(screen.getByText('loading…')).toBeInTheDocument();
    expect(container.querySelector('time')).toBeNull();
    expect(container.querySelector('.ui-freshness-value--loading')).not.toBeNull();
  });

  it('reports an unreadable timestamp instead of inventing one', () => {
    const { container } = render(<FreshnessStamp updatedAt="yesterday-ish" now={NOW} />);

    expect(container.querySelector('time')?.textContent).toBe('—');
    expect(container.querySelector('.ui-freshness-value--loading')).toBeNull();
  });

  it('takes label overrides without dropping the defaults it does not name', () => {
    const { container } = render(
      <FreshnessStamp
        updatedAt="2024-05-01T11:59:48Z"
        startedAt="2024-05-01T11:00:00Z"
        now={NOW}
        labels={{ updated: 'synced', up: 'running' }}
      />,
    );

    expect(container.querySelector('.ui-freshness-label')?.textContent).toBe('synced');
    expect(container.querySelectorAll('.ui-freshness-label')[1].textContent).toBe('running');

    const { container: loading } = render(
      <FreshnessStamp updatedAt={null} labels={{ loading: 'waiting…' }} />,
    );
    expect(loading.textContent).toContain('waiting…');
  });

  it('forwards className and style next to its own classes', () => {
    const { container } = render(
      <FreshnessStamp
        updatedAt="2024-05-01T11:59:48Z"
        now={NOW}
        className="header-stamp"
        style={{ marginLeft: 8 }}
      />,
    );

    const stamp = container.querySelector('.ui-freshness') as HTMLElement;
    expect(stamp.className).toBe('ui-freshness header-stamp');
    expect(stamp.style.marginLeft).toBe('8px');
  });

  it('re-reads the clock on every tick and clears the interval on unmount', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-05-01T12:00:00.000Z'));

    const { container, unmount } = render(
      <FreshnessStamp updatedAt="2024-05-01T11:59:57.000Z" startedAt="2024-05-01T11:59:00.000Z" />,
    );
    expect(container.querySelector('time')?.textContent).toBe('3s ago');

    act(() => {
      vi.advanceTimersByTime(2_000);
    });
    expect(container.querySelector('time')?.textContent).toBe('5s ago');
    expect(container.querySelectorAll('.ui-freshness-value')[1].textContent).toBe('1m 2s');

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('never schedules a timer for a frozen clock or a zero interval', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-05-01T12:00:00.000Z'));

    const frozen = render(<FreshnessStamp updatedAt="2024-05-01T11:59:57.000Z" now={NOW} />);
    expect(vi.getTimerCount()).toBe(0);

    const still = render(
      <FreshnessStamp updatedAt="2024-05-01T11:59:57.000Z" refreshInterval={0} />,
    );
    expect(vi.getTimerCount()).toBe(0);
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(still.container.querySelector('time')?.textContent).toBe('3s ago');

    frozen.unmount();
    still.unmount();
  });
});
