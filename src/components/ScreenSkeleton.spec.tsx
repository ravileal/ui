import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  ListCardSkeleton,
  PageHeaderSkeleton,
  PageSkeleton,
  SkeletonStatus,
} from './ScreenSkeleton';

describe('ScreenSkeleton', () => {
  it('exposes a busy status with the accessible label', () => {
    render(
      <SkeletonStatus label="Loading aliases">
        <div>placeholder</div>
      </SkeletonStatus>,
    );
    const status = screen.getByRole('status', { name: 'Loading aliases' });
    expect(status).toHaveAttribute('aria-busy', 'true');
  });

  it('renders page and header skeletons', () => {
    const { container } = render(
      <PageSkeleton label="Loading">
        <PageHeaderSkeleton />
        <ListCardSkeleton rows={3} />
      </PageSkeleton>,
    );
    expect(container.querySelectorAll('.ui-skeleton').length).toBeGreaterThan(0);
  });
});
