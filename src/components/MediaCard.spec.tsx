import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import MediaCard from './MediaCard';

describe('MediaCard', () => {
  it('renders the card base as its root with the media-card classes', () => {
    const { container } = render(<MediaCard coverImage={null} initials="AB" title="Frieren" />);
    const root = container.firstElementChild as HTMLElement;

    expect(root.className).toContain('ui-card');
    expect(root.className).toContain('ui-card--pad-none');
    expect(root.className).toContain('ui-media-card');
    expect(root.className).toContain('ui-media-card--vertical');
    expect(root.querySelector('.ui-card-content')).not.toBeNull();
  });

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
    const root = container.querySelector('.ui-media-card') as HTMLElement;

    expect(link.contains(footerButton)).toBe(false);
    expect(footer.contains(footerButton)).toBe(true);
    expect(footer.previousElementSibling).toBe(link);
    expect(root.contains(footer)).toBe(true);
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

  it('renders no cover box at all with fallback="none" and no image', () => {
    const { container } = render(
      <MediaCard coverImage={null} initials="FR" title="Frieren" fallback="none" />,
    );

    expect(container.querySelector('.ui-media-thumb')).toBeNull();
    expect(container.querySelector('.ui-media-card-thumb')).toBeNull();
    expect(container.querySelector('.ui-media-card-title')?.textContent).toBe('Frieren');
  });
});

describe('MediaCard states', () => {
  it('renders no state classes or busy flag by default', () => {
    const { container } = render(<MediaCard coverImage={null} initials="AB" title="Frieren" />);
    const root = container.firstElementChild as HTMLElement;

    expect(root.className).not.toContain('ui-card--interactive');
    expect(root.className).not.toContain('ui-card--selected');
    expect(root.className).not.toContain('ui-card--loading');
    expect(root.hasAttribute('aria-busy')).toBe(false);
    expect(container.querySelector('.ui-card-skeleton')).toBeNull();
  });

  it('forwards interactive to the card root', () => {
    const { container } = render(
      <MediaCard coverImage={null} initials="AB" title="Frieren" interactive />,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root.className).toContain('ui-card--interactive');
    expect(root.className).not.toContain('ui-card--selected');
  });

  it('forwards selected to the card root', () => {
    const { container } = render(
      <MediaCard coverImage={null} initials="AB" title="Frieren" selected />,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root.className).toContain('ui-card--selected');
    expect(root.className).not.toContain('ui-card--interactive');
  });

  it('marks the card busy and shows the skeleton while loading', () => {
    const { container } = render(
      <MediaCard
        coverImage="https://example.com/cover.jpg"
        initials="AB"
        title="Frieren"
        loading
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    const skeleton = container.querySelector('.ui-card-skeleton');

    expect(root.getAttribute('aria-busy')).toBe('true');
    expect(root.className).toContain('ui-card--loading');
    expect(skeleton).not.toBeNull();
    expect(skeleton?.getAttribute('aria-hidden')).toBe('true');
    // The real content stays mounted so the card keeps the height it will have.
    expect(container.querySelector('.ui-card-content .ui-media-card-lead')).not.toBeNull();
    expect(skeleton?.querySelectorAll('.ui-card-skeleton-block').length).toBeGreaterThanOrEqual(3);
  });

  it('drops the skeleton and the busy flag when loading turns off', () => {
    const { container, rerender } = render(
      <MediaCard coverImage={null} initials="AB" title="Frieren" loading />,
    );

    expect(container.querySelector('.ui-card-skeleton')).not.toBeNull();

    rerender(<MediaCard coverImage={null} initials="AB" title="Frieren" />);
    const root = container.firstElementChild as HTMLElement;

    expect(container.querySelector('.ui-card-skeleton')).toBeNull();
    expect(root.hasAttribute('aria-busy')).toBe(false);
  });
});
