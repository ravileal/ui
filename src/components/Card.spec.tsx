import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardBody, CardFooter, CardHeader, Section } from './Card';

describe('Card', () => {
  it('renders a plain card without state classes or aria attributes', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstElementChild as HTMLElement;

    expect(card.className).toBe('ui-card ui-card--pad-md');
    expect(card.hasAttribute('aria-busy')).toBe(false);
    expect(card.querySelector('.ui-card--interactive')).toBeNull();
    expect(container.querySelector('.ui-card-skeleton')).toBeNull();
  });

  it('always wraps children in .ui-card-content', () => {
    const { container } = render(<Card>Content</Card>);
    const content = container.querySelector('.ui-card-content');

    expect(content).not.toBeNull();
    expect(content?.textContent).toBe('Content');
    expect(content?.parentElement).toBe(container.firstElementChild);
  });

  it('maps the padding prop to its class', () => {
    const { container, rerender } = render(<Card padding="none">Content</Card>);

    expect((container.firstElementChild as HTMLElement).className).toContain('ui-card--pad-none');

    rerender(<Card padding="lg">Content</Card>);
    expect((container.firstElementChild as HTMLElement).className).toContain('ui-card--pad-lg');
  });

  it('adds the interactive class only when interactive is set', () => {
    const { container, rerender } = render(<Card>Content</Card>);
    const card = container.firstElementChild as HTMLElement;

    expect(card.className).not.toContain('ui-card--interactive');

    rerender(<Card interactive>Content</Card>);
    expect(card.className).toContain('ui-card--interactive');
  });

  it('adds the selected class only when selected is set', () => {
    const { container, rerender } = render(<Card>Content</Card>);
    const card = container.firstElementChild as HTMLElement;

    expect(card.className).not.toContain('ui-card--selected');

    rerender(<Card selected>Content</Card>);
    expect(card.className).toContain('ui-card--selected');
  });

  it('keeps interactive and selected independent', () => {
    const { container } = render(
      <Card interactive selected>
        Content
      </Card>,
    );
    const card = container.firstElementChild as HTMLElement;

    expect(card.className).toContain('ui-card--interactive');
    expect(card.className).toContain('ui-card--selected');
  });

  it('exposes aria-busy and renders the skeleton while loading', () => {
    const { container } = render(<Card loading>Content</Card>);
    const card = container.firstElementChild as HTMLElement;
    const skeleton = container.querySelector('.ui-card-skeleton');

    expect(card.getAttribute('aria-busy')).toBe('true');
    expect(card.className).toContain('ui-card--loading');
    expect(skeleton).not.toBeNull();
    expect(skeleton?.getAttribute('aria-hidden')).toBe('true');
    expect(skeleton?.querySelectorAll('.ui-card-skeleton-block')).toHaveLength(3);
  });

  it('keeps children in the DOM while loading', () => {
    render(
      <Card loading>
        <span>Real content</span>
      </Card>,
    );

    const content = document.querySelector('.ui-card-content');
    expect(content?.textContent).toBe('Real content');
    expect(screen.getByText('Real content')).toBeInTheDocument();
  });

  it('drops the skeleton and aria-busy when loading turns off', () => {
    const { container, rerender } = render(<Card loading>Content</Card>);

    expect(container.querySelector('.ui-card-skeleton')).not.toBeNull();

    rerender(<Card loading={false}>Content</Card>);
    const card = container.firstElementChild as HTMLElement;

    expect(container.querySelector('.ui-card-skeleton')).toBeNull();
    expect(card.hasAttribute('aria-busy')).toBe(false);
  });

  it('forwards className and style to the wrapper', () => {
    const { container } = render(
      <Card className="consumer-card" style={{ marginTop: 8 }}>
        Content
      </Card>,
    );
    const card = container.firstElementChild as HTMLElement;

    expect(card.className).toContain('consumer-card');
    expect(card.style.marginTop).toBe('8px');
  });
});

describe('Card composition', () => {
  it('still renders header, body and footer inside the card', () => {
    const { container } = render(
      <Card>
        <CardHeader
          title="Title"
          subtitle="Subtitle"
          actions={<button type="button">Act</button>}
        />
        <CardBody>Body</CardBody>
        <CardFooter>
          <button type="button">Save</button>
        </CardFooter>
      </Card>,
    );

    expect(container.querySelector('.ui-card-header')).not.toBeNull();
    expect(container.querySelector('.ui-card-body')?.textContent).toBe('Body');
    expect(container.querySelector('.ui-card-footer')).not.toBeNull();
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });

  it('keeps Section on the card contract', () => {
    const { container } = render(
      <Section title="Settings">
        <span>Row</span>
      </Section>,
    );
    const card = container.firstElementChild as HTMLElement;

    expect(card.className).toContain('ui-card--pad-none');
    expect(card.querySelector('.ui-card-content .ui-section-stack')).not.toBeNull();
    expect(card.hasAttribute('aria-busy')).toBe(false);
  });
});
