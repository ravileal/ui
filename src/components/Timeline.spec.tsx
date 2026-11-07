import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Timeline, TimelineBar } from './Timeline';

const T0 = Date.parse('2026-05-07T10:00:00.000Z');

const bars = (container: HTMLElement) => [
  ...container.querySelectorAll<HTMLElement>('.ui-timeline-bar'),
];
const markers = (container: HTMLElement) => [
  ...container.querySelectorAll<HTMLElement>('.ui-timeline-marker'),
];
const rows = (container: HTMLElement) => [
  ...container.querySelectorAll<HTMLElement>('.ui-timeline-row'),
];
const times = (container: HTMLElement) => [
  ...container.querySelectorAll<HTMLElement>('.ui-timeline-time'),
];

describe('Timeline', () => {
  it('normalises ISO, Date and epoch starts against the same window', () => {
    const { container } = render(
      <Timeline
        ariaLabel="Trace"
        items={[
          { label: 'proxy', source: 'proxy', start: '2026-05-07T10:00:00.000Z', ms: 120 },
          { label: 'hub', source: 'hub', start: new Date(T0 + 120), ms: 60 },
          { label: 'delivery', source: 'delivery', start: T0 + 180, ms: 120 },
        ]}
      />,
    );

    expect(screen.getByRole('group', { name: 'Trace' })).toBeTruthy();
    expect(rows(container)).toHaveLength(3);

    // The earliest start is the window origin; the window spans the data (300 ms).
    expect(bars(container).map((bar) => bar.style.left)).toEqual(['0%', '40%', '60%']);
    expect(bars(container).map((bar) => bar.style.width)).toEqual(['40%', '20%', '40%']);
  });

  it('formats the offset and the duration as readable numbers', () => {
    const { container } = render(
      <Timeline
        items={[
          { label: 'proxy', start: '2026-05-07T10:00:00.000Z', ms: 240 },
          { label: 'hub', start: T0 + 240, ms: null },
        ]}
      />,
    );

    const [first, second] = times(container);
    expect(first.textContent).toBe('+0 ms · 240 ms');
    expect(second.textContent).toBe('+240 ms');
  });

  it('renders a marker instead of a bar when a hop has no duration', () => {
    const { container } = render(
      <Timeline
        windowMs={300}
        items={[
          { label: 'proxy', source: 'proxy', offset: 120, ms: 90 },
          { label: 'delivery', source: 'delivery', offset: 240, ms: null },
        ]}
      />,
    );

    // Two rows, one segment: the instant hop is a dot, not a zero-width bar.
    expect(bars(container)).toHaveLength(1);
    expect(markers(container)).toHaveLength(1);
    expect(markers(container)[0].style.left).toBe('40%');
    expect(times(container)[1].textContent).toBe('+120 ms');
    expect(rows(container)[1].querySelector('.ui-timeline-bar')).toBeNull();
  });

  it('turns a failed hop red without disturbing its neighbours', () => {
    const { container } = render(
      <Timeline
        items={[
          { label: 'proxy', source: 'proxy', offset: 0, ms: 120 },
          {
            label: 'delivery',
            source: 'delivery',
            offset: 120,
            ms: 40,
            bad: true,
            detail: 'hub → delivery · FALHA 502',
          },
        ]}
      />,
    );

    const [ok, failed] = rows(container);
    expect(ok.className).not.toContain('ui-timeline-row--danger');
    expect(failed.className).toContain('ui-timeline-row--danger');
    expect(failed.textContent).toContain('FALHA 502');
    expect(failed.querySelector('.ui-timeline-bar')?.className).toContain(
      'ui-timeline-bar--danger',
    );
  });

  it('renders the empty label and no rows when the trace is empty', () => {
    const { container } = render(<Timeline items={[]} emptyLabel="No hops recorded" />);

    expect(screen.getByText('No hops recorded')).toBeTruthy();
    expect(container.querySelector('.ui-timeline-empty')).toBeTruthy();
    expect(rows(container)).toHaveLength(0);
  });

  it('keeps the bar out of the accessibility tree and the numbers readable', () => {
    const { container } = render(<Timeline items={[{ label: 'proxy', offset: 0, ms: 240 }]} />);

    expect(bars(container)[0].getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('.ui-timeline-track')?.textContent).toBe('');
    expect(container.querySelector('.ui-timeline-time')?.textContent).toBe('+0 ms · 240 ms');
  });

  it('clamps offsets and widths instead of overflowing a narrow window', () => {
    const { container } = render(
      <Timeline
        windowMs={300}
        items={[
          { label: 'slow', offset: 0, ms: 600 },
          { label: 'late', offset: 900, ms: 300 },
        ]}
      />,
    );

    const [slow, late] = bars(container);
    // 600 ms of work in a 300 ms window fills it; a hop past the window parks
    // on the right edge with nothing left to draw.
    expect(slow.style.left).toBe('0%');
    expect(slow.style.width).toBe('100%');
    expect(late.style.left).toBe('100%');
    expect(late.style.width).toBe('0%');
  });

  it('merges a caller className and style onto the root', () => {
    const { container } = render(
      <Timeline
        items={[{ label: 'proxy', offset: 0, ms: 10 }]}
        className="trace-panel"
        style={{ width: 320 }}
      />,
    );

    const root = container.querySelector<HTMLElement>('.ui-timeline');
    expect(root?.className).toContain('trace-panel');
    expect(root?.style.width).toBe('320px');
  });
});

describe('TimelineBar', () => {
  it('clamps both percentages into 0–100 and stays decorative', () => {
    const { container } = render(<TimelineBar offsetPct={140} widthPct={-20} />);
    const bar = container.querySelector<HTMLElement>('.ui-timeline-bar');

    expect(bar?.style.left).toBe('100%');
    expect(bar?.style.width).toBe('0%');
    expect(bar?.getAttribute('aria-hidden')).toBe('true');
  });

  it('applies the tone modifier and accepts its own className', () => {
    const { container } = render(
      <TimelineBar offsetPct={0} widthPct={50} tone="info" className="probe" />,
    );
    const bar = container.querySelector<HTMLElement>('.ui-timeline-bar');

    expect(bar?.className).toContain('ui-timeline-bar--info');
    expect(bar?.className).toContain('probe');
  });
});
