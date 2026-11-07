import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusDot from './StatusDot';
import type { StatusDotTone } from './StatusDot';

const TONES: StatusDotTone[] = ['info', 'success', 'warning', 'danger', 'accent', 'purple'];

describe('StatusDot', () => {
  it('renders a decorative md dot with no tone modifier by default', () => {
    const { container } = render(<StatusDot />);
    const dot = container.querySelector('.ui-status-dot') as HTMLElement;

    expect(dot).not.toBeNull();
    expect(dot.classList.contains('ui-status-dot--md')).toBe(true);
    for (const tone of TONES) {
      expect(dot.classList.contains(`ui-status-dot--${tone}`)).toBe(false);
    }
    expect(dot.classList.contains('ui-status-dot--neutral')).toBe(false);
    expect(dot.getAttribute('aria-hidden')).toBe('true');
    expect(dot.getAttribute('role')).toBeNull();
  });

  it('adds the tone modifier for every non-neutral tone', () => {
    for (const tone of TONES) {
      const { container, unmount } = render(<StatusDot tone={tone} />);
      const dot = container.querySelector('.ui-status-dot') as HTMLElement;
      expect(dot.classList.contains(`ui-status-dot--${tone}`)).toBe(true);
      unmount();
    }
  });

  it('adds the size modifier for every size', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    for (const size of sizes) {
      const { container, unmount } = render(<StatusDot size={size} />);
      const dot = container.querySelector('.ui-status-dot') as HTMLElement;
      expect(dot.classList.contains(`ui-status-dot--${size}`)).toBe(true);
      unmount();
    }
  });

  it('adds halo and pulse only when requested, and both compose', () => {
    const { container, rerender } = render(<StatusDot />);
    const dot = () => container.querySelector('.ui-status-dot') as HTMLElement;

    expect(dot().classList.contains('ui-status-dot--halo')).toBe(false);
    expect(dot().classList.contains('ui-status-dot--pulse')).toBe(false);

    rerender(<StatusDot halo />);
    expect(dot().classList.contains('ui-status-dot--halo')).toBe(true);
    expect(dot().classList.contains('ui-status-dot--pulse')).toBe(false);

    rerender(<StatusDot halo pulse />);
    expect(dot().classList.contains('ui-status-dot--halo')).toBe(true);
    expect(dot().classList.contains('ui-status-dot--pulse')).toBe(true);
  });

  it('becomes a labelled image when a label is given', () => {
    render(<StatusDot tone="danger" label="Sync failed" />);
    const dot = screen.getByRole('img', { name: 'Sync failed' });

    expect(dot.classList.contains('ui-status-dot--danger')).toBe(true);
    expect(dot.getAttribute('aria-hidden')).toBeNull();
  });

  it('forwards title, className and style', () => {
    const { container } = render(
      <StatusDot title="Last seen 2m ago" className="row-lead" style={{ marginRight: 4 }} />,
    );
    const dot = container.querySelector('.ui-status-dot') as HTMLElement;

    expect(dot.getAttribute('title')).toBe('Last seen 2m ago');
    expect(dot.classList.contains('row-lead')).toBe(true);
    expect(dot.style.marginRight).toBe('4px');
  });
});
