import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import MediaCard from './MediaCard';

describe('MediaCard', () => {
  it('renders the title inside an anchor when titleHref is set', () => {
    render(<MediaCard coverImage={null} initials="AB" title="Frieren" titleHref="/series/1" />);
    const link = screen.getByRole('link') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/series/1');
    expect(link.className).toContain('ui-media-card-lead');
    expect(link.className).toContain('is-link');
    expect(link.textContent).toContain('Frieren');
  });

  it('keeps the footer as a sibling of the anchor', () => {
    const { container } = render(
      <MediaCard
        coverImage={null}
        initials="AB"
        title="Frieren"
        titleHref="/series/1"
        footer={<button type="button">Monitor</button>}
      />,
    );
    const link = container.querySelector('a') as HTMLAnchorElement;
    const footerButton = screen.getByRole('button', { name: 'Monitor' });
    const footer = container.querySelector('.ui-media-card-footer') as HTMLElement;

    expect(link.contains(footerButton)).toBe(false);
    expect(footer.contains(footerButton)).toBe(true);
    expect(footer.parentElement).toBe(container.querySelector('.ui-media-card'));
  });

  it('renders no anchor without titleHref', () => {
    const { container } = render(<MediaCard coverImage={null} initials="AB" title="Frieren" />);
    expect(container.querySelector('a')).toBeNull();
    expect(container.querySelector('.ui-media-card-lead')?.tagName).toBe('DIV');
  });

  it('uses renderTitleLink and passes the link props through', () => {
    const renderTitleLink = vi.fn(
      ({ href, className, children }: { href: string; className: string; children: ReactNode }) => (
        <span data-testid="custom-link" data-href={href} className={className}>
          {children}
        </span>
      ),
    );
    render(
      <MediaCard
        coverImage={null}
        initials="AB"
        title="Frieren"
        titleHref="/series/1"
        renderTitleLink={renderTitleLink}
      />,
    );

    expect(renderTitleLink).toHaveBeenCalledTimes(1);
    const props = renderTitleLink.mock.calls[0][0];
    expect(props.href).toBe('/series/1');
    expect(props.className).toBe('ui-media-card-lead is-link');

    const custom = screen.getByTestId('custom-link');
    expect(custom.className).toBe('ui-media-card-lead is-link');
    expect(custom.textContent).toContain('Frieren');
  });

  it('does not call renderTitleLink without titleHref', () => {
    const renderTitleLink = vi.fn(() => <span />);
    render(
      <MediaCard
        coverImage={null}
        initials="AB"
        title="Frieren"
        renderTitleLink={renderTitleLink}
      />,
    );
    expect(renderTitleLink).not.toHaveBeenCalled();
  });

  it('applies the orientation class', () => {
    const { container, rerender } = render(
      <MediaCard coverImage={null} initials="AB" title="Frieren" />,
    );
    expect(container.querySelector('.ui-media-card')?.className).toContain(
      'ui-media-card--vertical',
    );

    rerender(
      <MediaCard coverImage={null} initials="AB" title="Frieren" orientation="horizontal" />,
    );
    expect(container.querySelector('.ui-media-card')?.className).toContain(
      'ui-media-card--horizontal',
    );
  });

  it('renders the initials fallback and the meta line', () => {
    const { container } = render(
      <MediaCard coverImage={null} initials="FR" title="Frieren" meta="2023 · 28 episodes" />,
    );
    expect(
      container.querySelector('.ui-media-card-thumb .ui-media-thumb-fallback')?.textContent,
    ).toBe('FR');
    expect(container.querySelector('.ui-media-card-meta')?.textContent).toBe('2023 · 28 episodes');
  });
});
