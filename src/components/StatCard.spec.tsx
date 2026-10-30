import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCard from './StatCard';

describe('StatCard', () => {
  it('renders the compact variant by default', () => {
    render(<StatCard label="Files" value="12" hint="Last run" />);
    expect(screen.getByText('Files')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Last run')).toBeInTheDocument();
  });

  it('renders the hero variant with accent and media', () => {
    const { container } = render(
      <StatCard
        variant="hero"
        label="Total Spent"
        value="$100.00"
        hint="+$10 vs last month"
        hintColor="red"
        accent="#00c9a7"
        media={<span>R</span>}
      />,
    );

    expect(container.querySelector('.ui-stat-card--hero')).toBeInTheDocument();
    expect(container.querySelector('.ui-stat-card-accent')).toHaveStyle({ background: '#00c9a7' });
    expect(screen.getByText('R')).toBeInTheDocument();
    expect(screen.getByText('+$10 vs last month')).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });
});
