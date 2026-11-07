import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FooterNote from './FooterNote';

describe('FooterNote', () => {
  it('renders the note inside a footer landmark', () => {
    render(<FooterNote>event-hub — built for the home LAN</FooterNote>);

    const footer = screen.getByRole('contentinfo');
    expect(footer.className).toContain('ui-footer-note');
    expect(footer.querySelector('.ui-footer-note-text')?.textContent).toBe(
      'event-hub — built for the home LAN',
    );
  });

  it('puts the metadata on its own line under the note', () => {
    const { container } = render(<FooterNote meta={<span>v1.7.0</span>}>event-hub</FooterNote>);

    const children = [...(container.querySelector('.ui-footer-note')?.children ?? [])];
    expect(children.map((element) => element.className)).toEqual([
      'ui-footer-note-text',
      'ui-footer-note-meta',
    ]);
    expect(children[1].textContent).toBe('v1.7.0');
  });

  it('omits the lines it was not given', () => {
    const { container, rerender } = render(<FooterNote />);
    expect(container.querySelector('.ui-footer-note')?.children).toHaveLength(0);

    rerender(<FooterNote meta="build 42" />);
    expect(container.querySelector('.ui-footer-note-text')).toBeNull();
    expect(container.querySelector('.ui-footer-note-meta')?.textContent).toBe('build 42');
  });

  it('forwards className and style without dropping its own class', () => {
    const { container } = render(
      <FooterNote className="page-end" style={{ paddingBottom: 24 }}>
        event-hub
      </FooterNote>,
    );

    const footer = container.querySelector('footer') as HTMLElement;
    expect(footer.className).toBe('ui-footer-note page-end');
    expect(footer.style.paddingBottom).toBe('24px');
  });
});
