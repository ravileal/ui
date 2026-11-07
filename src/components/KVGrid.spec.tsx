import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import KVGrid, { type KVGridItem } from './KVGrid';

const ITEMS: KVGridItem[] = [
  { label: 'Status', value: 'Delivered' },
  { label: 'Attempts', value: 3 },
  { label: 'Target', value: 'https://hooks.example.com/very/long/unbroken/path', mono: true },
  { label: 'Last error', value: 'timeout', tone: 'danger' },
];

describe('KVGrid', () => {
  it('renders a definition list with one term and one definition per item', () => {
    const { container } = render(<KVGrid items={ITEMS} ariaLabel="Delivery" />);

    const terms = screen.getAllByRole('term');
    const definitions = screen.getAllByRole('definition');
    expect(terms).toHaveLength(ITEMS.length);
    expect(definitions).toHaveLength(ITEMS.length);
    expect(terms[0].textContent).toBe('Status');
    expect(definitions[0].textContent).toBe('Delivered');
    expect(container.querySelector('dl')?.getAttribute('aria-label')).toBe('Delivery');
  });

  it('falls back to an em dash when a value is undefined or null', () => {
    render(
      <KVGrid
        items={[
          { label: 'Missing', value: undefined },
          { label: 'Null', value: null },
          { label: 'Present', value: '0' },
        ]}
      />,
    );

    const values = screen.getAllByRole('definition');
    expect(values[0].textContent).toBe('—');
    expect(values[1].textContent).toBe('—');
    expect(values[0].className).toContain('ui-kv-grid-value--empty');
    expect(values[2].textContent).toBe('0');
    expect(values[2].className).not.toContain('ui-kv-grid-value--empty');
  });

  it('honours a custom empty value', () => {
    render(<KVGrid items={[{ label: 'Probe', value: null }]} emptyValue="n/a" />);
    expect(screen.getByRole('definition').textContent).toBe('n/a');
  });

  it('applies the mono and tone value modifiers', () => {
    const { container } = render(<KVGrid items={ITEMS} />);
    const values = container.querySelectorAll('.ui-kv-grid-value');

    expect(values[2].className).toContain('ui-kv-grid-value--mono');
    expect(values[3].className).toContain('ui-kv-grid-value--danger');
    expect(values[0].className).not.toContain('ui-kv-grid-value--neutral');
    expect(values[0].className).not.toContain('ui-kv-grid-value--mono');
  });

  it('exposes the column count and layout as modifier classes', () => {
    const { container, rerender } = render(<KVGrid items={ITEMS} columns={1} />);
    expect(container.querySelector('.ui-kv-grid')?.className).toContain('ui-kv-grid--cols-1');
    expect(container.querySelector('.ui-kv-grid')?.className).toContain('ui-kv-grid--stack');

    rerender(<KVGrid items={ITEMS} columns={3} layout="inline" valueAlign="end" divided />);
    const grid = container.querySelector('.ui-kv-grid');
    expect(grid?.className).toContain('ui-kv-grid--cols-3');
    expect(grid?.className).toContain('ui-kv-grid--inline');
    expect(grid?.className).toContain('ui-kv-grid--align-end');
    expect(grid?.className).toContain('ui-kv-grid--divided');
  });

  it('forwards the value title and the caller className', () => {
    const { container } = render(
      <KVGrid
        items={[{ label: 'Hash', value: '8f1c2b9d4e', title: 'Full hash' }]}
        className="sheet-grid"
      />,
    );
    expect(container.querySelector('.ui-kv-grid')?.className).toContain('sheet-grid');
    expect(container.querySelector('.ui-kv-grid-value')?.getAttribute('title')).toBe('Full hash');
  });
});
