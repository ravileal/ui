import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Legend from './Legend';
import type { LegendItem } from './Legend';

const ITEMS: LegendItem[] = [
  { label: 'Delivered', tone: 'success' },
  { label: 'In flight', tone: 'warning' },
  { label: 'Failed', tone: 'danger' },
];

describe('Legend', () => {
  it('renders one item per entry, each with a decorative dot and a label', () => {
    const { container } = render(<Legend items={ITEMS} ariaLabel="Delivery status" />);

    expect(screen.getByRole('list', { name: 'Delivery status' }).className).toContain(
      'ui-legend-items',
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(ITEMS.length);

    const first = container.querySelector('.ui-legend-item') as HTMLElement;
    const dot = first.querySelector('.ui-status-dot') as HTMLElement;
    expect(dot.getAttribute('aria-hidden')).toBe('true');
    expect(first.querySelector('.ui-legend-label')?.textContent).toBe('Delivered');
  });

  it('forwards each item tone to its dot and defaults to neutral', () => {
    const { container } = render(<Legend items={[...ITEMS, { label: 'Unknown' }]} />);
    const dots = container.querySelectorAll('.ui-status-dot');

    expect(dots[0].classList.contains('ui-status-dot--success')).toBe(true);
    expect(dots[1].classList.contains('ui-status-dot--warning')).toBe(true);
    expect(dots[2].classList.contains('ui-status-dot--danger')).toBe(true);
    expect(dots[3].classList.contains('ui-status-dot--neutral')).toBe(false);
    expect(dots[3].classList.contains('ui-status-dot--success')).toBe(false);
  });

  it('lays out inline by default and stacks only when asked', () => {
    const { container, rerender } = render(<Legend items={ITEMS} />);
    const root = () => container.querySelector('.ui-legend') as HTMLElement;

    expect(root().classList.contains('ui-legend--column')).toBe(false);

    rerender(<Legend items={ITEMS} orientation="column" />);
    expect(root().classList.contains('ui-legend--column')).toBe(true);
  });

  it('sets the note under the dots and omits it when absent', () => {
    const { container, rerender } = render(
      <Legend items={ITEMS} note="Dot colour follows the delivery state, not the payment." />,
    );

    const note = container.querySelector('.ui-legend-note') as HTMLElement;
    expect(note.textContent).toBe('Dot colour follows the delivery state, not the payment.');
    expect(container.querySelector('.ui-legend-items')?.contains(note)).toBe(false);

    rerender(<Legend items={ITEMS} />);
    expect(container.querySelector('.ui-legend-note')).toBeNull();
  });

  it('renders a note-only legend without a list', () => {
    render(<Legend items={[]} note="No dots, just the rule." />);

    expect(screen.getByText('No dots, just the rule.')).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('renders nothing when there is neither a dot nor a note', () => {
    const { container } = render(<Legend items={[]} />);
    expect(container.querySelector('.ui-legend')).toBeNull();
  });

  it('forwards the item title, the className and the style', () => {
    const { container } = render(
      <Legend
        items={[{ label: 'Late', title: 'More than 10 days late' }]}
        className="chart-key"
        style={{ padding: 8 }}
      />,
    );
    const root = container.querySelector('.ui-legend') as HTMLElement;
    const item = container.querySelector('.ui-legend-item') as HTMLElement;

    expect(item.getAttribute('title')).toBe('More than 10 days late');
    expect(root.classList.contains('chart-key')).toBe(true);
    expect(root.style.padding).toBe('8px');
  });
});
