import { describe, it, expect, vi } from 'vitest';
import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import Item from './Item';

describe('Item', () => {
  it('renders the title, subtitle and meta inside the text block', () => {
    const { container } = render(
      <Item title="Sousou no Frieren" subtitle="Madhouse" meta="2023 · 28 episodes" />,
    );

    expect(container.querySelector('.ui-item-title')?.textContent).toBe('Sousou no Frieren');
    expect(container.querySelector('.ui-item-subtitle')?.textContent).toBe('Madhouse');
    expect(container.querySelector('.ui-item-meta')?.textContent).toBe('2023 · 28 episodes');
    expect(container.querySelector('.ui-media-thumb')).toBeNull();
  });

  it('lets the text fill the row when there is no media', () => {
    const { container } = render(<Item title="Frieren" />);

    expect(container.querySelector('.ui-media-thumb')).toBeNull();
    expect(container.querySelector('.ui-item-lead .ui-item-text')).not.toBeNull();
    expect(screen.getByText('Frieren')).toBeInTheDocument();
  });

  it('renders a thumb beside the text by default', () => {
    const { container } = render(<Item title="Frieren" media={{ src: null, initials: 'FR' }} />);

    const thumb = container.querySelector('.ui-item-lead .ui-media-thumb');
    expect(thumb).not.toBeNull();
    expect(thumb?.className).toContain('ui-item-thumb');
    expect(thumb?.className).toContain('ui-media-thumb--sm');
    expect(thumb?.textContent).toBe('FR');
  });

  it('renders no thumb when the media asks for fallback="none" and has no src', () => {
    const { container } = render(
      <Item title="Frieren" media={{ src: null, initials: 'FR', fallback: 'none' }} />,
    );

    expect(container.querySelector('.ui-media-thumb')).toBeNull();
    expect(container.querySelector('.ui-media-thumb-fallback')).toBeNull();
    expect(container.querySelector('.ui-item-title')?.textContent).toBe('Frieren');
  });

  it('maps the item size to the title class and the thumb size', () => {
    const { container, rerender } = render(
      <Item title="Frieren" size="lg" media={{ src: null, initials: 'FR' }} />,
    );

    expect(container.querySelector('.ui-card')?.className).toContain('ui-item--lg');
    expect(container.querySelector('.ui-media-thumb')?.className).toContain('ui-media-thumb--md');

    rerender(<Item title="Frieren" size="sm" media={{ src: null, initials: 'FR' }} />);

    expect(container.querySelector('.ui-card')?.className).toContain('ui-item--sm');
    expect(container.querySelector('.ui-media-thumb')?.className).toContain('ui-media-thumb--xs');
  });

  it('scales the cover above the text as a poster, whatever the item size', () => {
    const { container } = render(
      <Item title="Frieren" size="sm" mediaPosition="top" media={{ src: null, initials: 'FR' }} />,
    );

    // The poster spans the body, so its initials take the md scale; the sm item
    // still drives the title size.
    expect(container.querySelector('.ui-media-thumb')?.className).toContain('ui-media-thumb--md');
    expect(container.querySelector('.ui-item')?.className).toContain('ui-item--sm');
  });

  it('lets the media size override the poster scale', () => {
    const { container } = render(
      <Item
        title="Frieren"
        mediaPosition="top"
        media={{ src: null, initials: 'FR', size: 'xs' }}
      />,
    );

    expect(container.querySelector('.ui-media-thumb')?.className).toContain('ui-media-thumb--xs');
  });

  it('applies the media position class and the base card padding none', () => {
    const { container, rerender } = render(
      <Item title="Frieren" mediaPosition="top" media={{ src: null, initials: 'FR' }} />,
    );

    const card = container.querySelector('.ui-card') as HTMLElement;
    expect(card.className).toContain('ui-item');
    expect(card.className).toContain('ui-item--md');
    expect(card.className).toContain('ui-item--top');
    expect(card.className).toContain('ui-card--pad-none');

    rerender(<Item title="Frieren" />);

    expect(card.className).toContain('ui-item--start');
  });

  it('wraps thumb and text in an anchor and keeps the actions outside it', () => {
    const { container } = render(
      <Item
        title="Frieren"
        href="/series/frieren"
        media={{ src: null, initials: 'FR' }}
        actions={<button type="button">Monitor</button>}
        footer={<span>Footer</span>}
      />,
    );

    const link = screen.getByRole('link');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/series/frieren');
    expect(link.className).toContain('ui-item-lead');
    expect(link.className).toContain('is-link');
    expect(link.querySelector('.ui-media-thumb')).not.toBeNull();
    expect(link.querySelector('.ui-item-text')).not.toBeNull();

    const action = screen.getByRole('button', { name: 'Monitor' });
    expect(link.contains(action)).toBe(false);
    expect(container.querySelector('.ui-item-actions')?.contains(action)).toBe(true);
    expect(link.contains(screen.getByText('Footer'))).toBe(false);
    expect(container.querySelector('.ui-item-footer')?.textContent).toBe('Footer');
  });

  it('uses a plain div for the lead when there is no href', () => {
    const { container } = render(<Item title="Frieren" />);

    const lead = container.querySelector('.ui-item-lead') as HTMLElement;
    expect(lead.tagName).toBe('DIV');
    expect(lead.className).not.toContain('is-link');
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders through `renderLink` with the href, class and content it was given', () => {
    const { container } = render(
      <Item
        title="Frieren"
        href="/series/frieren"
        renderLink={({ href, className, children }) => (
          <span className={className} data-href={href} data-testid="router-link">
            {children}
          </span>
        )}
      />,
    );

    const custom = screen.getByTestId('router-link');
    expect(custom.getAttribute('data-href')).toBe('/series/frieren');
    expect(custom.className).toContain('ui-item-lead');
    expect(custom.className).toContain('is-link');
    expect(container.querySelector('.ui-item-title')?.textContent).toBe('Frieren');
  });

  // Card gains `loading` (and its `aria-busy` + skeleton) in 0.5.0 from a
  // parallel stream. Until that merge lands here, a Card stub that implements
  // the documented state proves Item forwards the prop, and this stays valid
  // once the real component owns the attribute.
  it('forwards `loading` to the card (aria-busy on the card element)', async () => {
    vi.resetModules();
    vi.doMock('./Card', () => ({
      Card: ({
        loading,
        className,
        children,
      }: {
        loading?: boolean;
        className?: string;
        children?: ReactNode;
      }) => (
        <div
          className={['ui-card', className].filter(Boolean).join(' ')}
          aria-busy={loading ? 'true' : undefined}
        >
          {children}
        </div>
      ),
    }));

    const { default: IsolatedItem } = await import('./Item');
    const { unmount } = render(<IsolatedItem title="Frieren" loading />);

    const card = document.querySelector('.ui-card') as HTMLElement;
    expect(card.getAttribute('aria-busy')).toBe('true');

    unmount();
    vi.doUnmock('./Card');
    vi.resetModules();
  });
});

describe('Item poster variant', () => {
  it('leads with the cover even when the caller asks for a side thumb', () => {
    const { container } = render(
      <Item
        variant="poster"
        mediaPosition="start"
        media={{ src: null, initials: 'FR' }}
        title="Sousou no Frieren"
      />,
    );

    const item = container.querySelector('.ui-item');
    expect(item?.className).toContain('ui-item--poster');
    expect(item?.className).toContain('ui-item--top');
    expect(container.querySelector('.ui-item-thumb.ui-media-thumb--md')).not.toBeNull();
  });

  it('pins the badge inside the lead, after the cover', () => {
    const { container } = render(
      <Item
        variant="poster"
        media={{ src: null, initials: 'FR' }}
        title="Frieren"
        href="/series/frieren"
        badge={<span>Monitorado</span>}
      />,
    );

    const lead = container.querySelector('.ui-item-lead');
    const children = Array.from(lead?.children ?? []);
    const badge = lead?.querySelector('.ui-item-badge');
    expect(badge?.textContent).toBe('Monitorado');
    expect(children.indexOf(badge as Element)).toBeGreaterThan(
      children.findIndex((child) => child.className.includes('ui-media-thumb')),
    );
    expect(badge?.closest('a')).toBe(lead);
  });

  it('renders no badge on a surface card, and none without the prop', () => {
    const { container, rerender } = render(
      <Item
        title="Frieren"
        media={{ src: null, initials: 'FR' }}
        badge={<span>Monitorado</span>}
      />,
    );

    expect(container.querySelector('.ui-item-badge')).toBeNull();

    rerender(<Item variant="poster" title="Frieren" media={{ src: null, initials: 'FR' }} />);
    expect(container.querySelector('.ui-item-badge')).toBeNull();
  });

  it('renders coverAction outside the anchor, in its own cover slot', () => {
    const { container } = render(
      <Item
        variant="poster"
        media={{ src: null, initials: 'FR' }}
        title="Frieren"
        href="/series/frieren"
        coverAction={<button type="button">Monitor</button>}
      />,
    );

    const link = screen.getByRole('link');
    const action = screen.getByRole('button', { name: 'Monitor' });
    expect(link.contains(action)).toBe(false);
    expect(container.querySelector('.ui-item-cover-action')?.contains(action)).toBe(true);

    action.focus();
    expect(action).toHaveFocus();
  });

  it('only renders coverAction on a poster', () => {
    const { container, rerender } = render(
      <Item
        title="Frieren"
        media={{ src: null, initials: 'FR' }}
        coverAction={<button type="button">Monitor</button>}
      />,
    );

    expect(container.querySelector('.ui-item-cover-action')).toBeNull();

    rerender(
      <Item
        variant="poster"
        media={{ src: null, initials: 'FR' }}
        title="Frieren"
        coverAction={<button type="button">Monitor</button>}
      />,
    );
    expect(container.querySelector('.ui-item-cover-action')).not.toBeNull();
  });

  it('keeps the poster text and footer slots inside the card', () => {
    const { container } = render(
      <Item
        variant="poster"
        media={{ src: null, initials: 'FR' }}
        title="Frieren"
        subtitle="Madhouse"
        meta="2023 · 28 eps"
        footer={<span>switch</span>}
      />,
    );

    expect(container.querySelector('.ui-item--poster .ui-item-body .ui-item-text')).not.toBeNull();
    expect(container.querySelector('.ui-item--poster .ui-item-footer')?.textContent).toBe('switch');
  });
});
