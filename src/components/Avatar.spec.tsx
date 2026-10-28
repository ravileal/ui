import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Avatar from './Avatar';

describe('Avatar', () => {
  it('renders the first letter with an accessible name', () => {
    render(<Avatar name="Ravi" color="#4f7cff" />);
    expect(screen.getByRole('img', { name: 'Ravi' })).toHaveTextContent('R');
  });

  it('uppercases the initial and accepts a custom label', () => {
    render(<Avatar name="keri" color="#00c9a7" ariaLabel="Keri Leal" />);
    expect(screen.getByRole('img', { name: 'Keri Leal' })).toHaveTextContent('K');
  });

  it('handles empty names and decorative usage', () => {
    render(<Avatar name="  " color="#000" ariaLabel="" />);
    const avatar = screen.getByText('?');
    expect(avatar).toHaveAttribute('aria-hidden', 'true');
  });
});
