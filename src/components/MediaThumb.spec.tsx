import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MediaThumb from './MediaThumb';

describe('MediaThumb', () => {
  it('renders a lazy image with the alt text when src is set', () => {
    render(<MediaThumb src="https://example.com/cover.jpg" alt="Cover" initials="AB" />);
    const image = screen.getByRole('img') as HTMLImageElement;
    expect(image.getAttribute('src')).toBe('https://example.com/cover.jpg');
    expect(image.getAttribute('alt')).toBe('Cover');
    expect(image.getAttribute('loading')).toBe('lazy');
    expect(screen.queryByText('AB')).toBeNull();
  });

  it('renders the initials fallback and no image when src is null', () => {
    const { container } = render(<MediaThumb src={null} initials="AB" />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.ui-media-thumb-fallback')?.textContent).toBe('AB');
  });

  it('falls back after an image error and retries when src changes', () => {
    const { container, rerender } = render(
      <MediaThumb src="https://example.com/a.jpg" initials="AB" />,
    );
    // The cover is decorative (alt=""), so it has no `img` role: query the node.
    fireEvent.error(container.querySelector('img') as HTMLImageElement);

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.ui-media-thumb-fallback')?.textContent).toBe('AB');

    rerender(<MediaThumb src="https://example.com/b.jpg" initials="AB" />);

    const retried = container.querySelector('img') as HTMLImageElement;
    expect(retried.getAttribute('src')).toBe('https://example.com/b.jpg');
  });

  it('applies the size class and the inline overrides', () => {
    const { container } = render(
      <MediaThumb src={null} initials="AB" size="sm" radius={8} aspectRatio="1 / 1" />,
    );
    const thumb = container.querySelector('.ui-media-thumb') as HTMLElement;

    expect(thumb.className).toContain('ui-media-thumb--sm');
    expect(thumb.style.getPropertyValue('--ui-media-thumb-radius')).toBe('8px');
    expect(thumb.style.getPropertyValue('--ui-media-thumb-ratio')).toBe('1 / 1');
  });
});
