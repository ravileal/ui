import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MetaList from './MetaList';

const ITEMS = [
  { label: 'Episodes', value: '28' },
  { label: 'Status', value: 'Finished', tone: 'muted' as const },
  { label: 'Hash', value: '8f1c2b9d4e', mono: true },
  { value: 'Danger', tone: 'danger' as const },
];

describe('MetaList', () => {
  it('renders one listitem per entry with label and value spans', () => {
    const { container } = render(<MetaList items={ITEMS} ariaLabel="Details" />);

    const list = screen.getByRole('list', { name: 'Details' });
    expect(list.className).toContain('ui-meta-list');
    expect(screen.getAllByRole('listitem')).toHaveLength(ITEMS.length);

    const first = container.querySelector('.ui-meta-list-item') as HTMLElement;
    expect(first.querySelector('.ui-meta-list-label')?.textContent).toBe('Episodes');
    expect(first.querySelector('.ui-meta-list-value')?.textContent).toBe('28');
  });

  it('applies the mono and tone value modifiers', () => {
    const { container } = render(<MetaList items={ITEMS} />);
    const values = container.querySelectorAll('.ui-meta-list-value');

    expect(values[1].className).toContain('ui-meta-list-value--muted');
    expect(values[2].className).toContain('ui-meta-list-value--mono');
    expect(values[3].className).toContain('ui-meta-list-value--danger');
    expect(values[0].className).not.toContain('ui-meta-list-value--default');
  });

  it('adds the separator modifier only when requested and never renders a dot', () => {
    const { container, rerender } = render(<MetaList items={ITEMS} />);
    expect(container.querySelector('.ui-meta-list')?.className).not.toContain(
      'ui-meta-list--separator',
    );

    rerender(<MetaList items={ITEMS} separator />);
    expect(container.querySelector('.ui-meta-list')?.className).toContain(
      'ui-meta-list--separator',
    );
    expect(container.textContent).not.toContain('·');
  });

  it('forwards the item title', () => {
    const { container } = render(<MetaList items={[{ value: 'x', title: 'Tooltip' }]} />);
    expect(container.querySelector('.ui-meta-list-item')?.getAttribute('title')).toBe('Tooltip');
  });
});
