import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Skeleton from './Skeleton';

describe('Skeleton', () => {
  it('renders a decorative placeholder with the requested size', () => {
    const { container } = render(<Skeleton width={80} height={12} radius={4} />);
    const el = container.firstElementChild as HTMLElement;

    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).toHaveClass('ui-skeleton');
    expect(el.style.width).toBe('80px');
    expect(el.style.height).toBe('12px');
    expect(el.style.borderRadius).toBe('4px');
  });

  it('renders a circle when requested', () => {
    const { container } = render(<Skeleton width={20} height={20} circle />);
    const el = container.firstElementChild as HTMLElement;

    expect(el.style.borderRadius).toBe('50%');
  });
});
