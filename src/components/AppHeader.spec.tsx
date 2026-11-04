import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AppHeader from './AppHeader';

describe('AppHeader', () => {
  it('renders the brand, the switcher, the chips and the actions in one header', () => {
    render(
      <AppHeader
        brand={<a href="/">anime-tracker</a>}
        nav={<nav aria-label="Seções">Biblioteca</nav>}
        meta={<span>Biblioteca: /animes</span>}
        actions={<button type="button">Adicionar</button>}
      />,
    );

    const header = screen.getByRole('banner', { name: 'Application header' });
    expect(header.querySelector('.ui-app-header-brand a')?.textContent).toBe('anime-tracker');
    expect(header.querySelector('.ui-app-header-nav nav')).not.toBeNull();
    expect(header.querySelector('.ui-app-header-meta')?.textContent).toBe('Biblioteca: /animes');
    expect(header.querySelector('.ui-app-header-actions button')?.textContent).toBe('Adicionar');
  });

  it('keeps the five slots inside the centred measure', () => {
    render(
      <AppHeader
        brand={<a href="/">anime-tracker</a>}
        nav={<nav aria-label="Seções">Biblioteca</nav>}
        meta={<span>Biblioteca: /animes</span>}
        actions={<button type="button">Adicionar</button>}
      />,
    );

    const header = screen.getByRole('banner', { name: 'Application header' });
    const inner = header.querySelector('.ui-app-header-inner');
    expect(inner).not.toBeNull();
    for (const slot of ['brand', 'nav', 'spacer', 'meta', 'actions']) {
      expect(inner?.querySelector(`.ui-app-header-${slot}`)).not.toBeNull();
    }
  });

  it('is sticky by default and honours sticky={false}', () => {
    const { container, rerender } = render(<AppHeader brand="anime-tracker" />);

    expect(container.querySelector('.ui-app-header')?.className).toContain('is-sticky');

    rerender(<AppHeader brand="anime-tracker" sticky={false} />);
    expect(container.querySelector('.ui-app-header')?.className).not.toContain('is-sticky');
  });

  it('omits every empty slot, including the chip cluster', () => {
    const { container } = render(<AppHeader brand="anime-tracker" />);

    expect(container.querySelector('.ui-app-header-nav')).toBeNull();
    expect(container.querySelector('.ui-app-header-meta')).toBeNull();
    expect(container.querySelector('.ui-app-header-actions')).toBeNull();
    // The spacer stays: it is what holds the right cluster against the edge.
    expect(container.querySelectorAll('.ui-app-header-spacer')).toHaveLength(1);
  });

  it('keeps the switcher on the bar instead of a row of its own', () => {
    const { container } = render(
      <AppHeader
        brand={<a href="/">anime-tracker</a>}
        nav={<nav aria-label="Seções">Biblioteca</nav>}
        actions={<button type="button">Adicionar</button>}
      />,
    );

    const inner = container.querySelector('.ui-app-header-inner') as HTMLElement;
    // One flex row: brand, switcher, spacer and actions are siblings, so the
    // `flex-wrap` on the bar — not a forced full-width switcher — decides when
    // the switcher drops to a second row.
    expect([...inner.children].map((element) => element.className)).toEqual([
      'ui-app-header-brand',
      'ui-app-header-nav',
      'ui-app-header-spacer',
      'ui-app-header-actions',
    ]);
    // Inline does not mean hidden: the switcher and its content stay rendered.
    const navSlot = inner.querySelector('.ui-app-header-nav') as HTMLElement;
    expect(navSlot.parentElement).toBe(inner);
    expect(navSlot.querySelector('nav[aria-label="Seções"]')?.textContent).toBe('Biblioteca');
  });

  it('takes an accessible name for the landmark', () => {
    render(<AppHeader brand="anime-tracker" ariaLabel="Cabeçalho do anime-tracker" />);

    expect(screen.getByRole('banner', { name: 'Cabeçalho do anime-tracker' })).toBeInTheDocument();
  });

  it('forwards className and style without dropping its own classes', () => {
    const { container } = render(
      <AppHeader brand="anime-tracker" className="app-top" style={{ maxWidth: 1600 }} />,
    );

    const header = container.querySelector('header') as HTMLElement;
    expect(header.className).toContain('ui-app-header');
    expect(header.className).toContain('app-top');
    expect(header.style.maxWidth).toBe('1600px');
  });
});
