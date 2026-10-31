import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Item from './Item';
import { ItemGrid } from './ItemGrid';

interface Show {
  id: string;
  title: string;
}

const SHOWS: Show[] = [
  { id: 'frieren', title: 'Sousou no Frieren' },
  { id: 'vinland', title: 'Vinland Saga' },
  { id: 'chainsaw', title: 'Chainsaw Man' },
];

function renderShow(show: Show) {
  return <Item title={show.title} subtitle="Studio" meta="2023" />;
}

describe('ItemGrid', () => {
  it('renders a real list with one list item per entry', () => {
    render(<ItemGrid items={SHOWS} renderItem={renderShow} />);

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(SHOWS.length);
    expect(screen.getByText('Vinland Saga')).toBeInTheDocument();
  });

  it('passes the item and its index to renderItem', () => {
    const renderItem = vi.fn((show: Show) => <span>{show.title}</span>);

    render(<ItemGrid items={SHOWS} renderItem={renderItem} />);

    expect(renderItem).toHaveBeenCalledTimes(SHOWS.length);
    expect(renderItem).toHaveBeenNthCalledWith(1, SHOWS[0], 0);
    expect(renderItem).toHaveBeenNthCalledWith(3, SHOWS[2], 2);
  });

  it('defaults to the grid layout and marks the container with the layout class', () => {
    const { container, rerender } = render(<ItemGrid items={SHOWS} renderItem={renderShow} />);

    const list = container.querySelector('.ui-item-grid') as HTMLElement;
    expect(list.tagName).toBe('UL');
    expect(list.className).toContain('ui-item-grid--grid');

    rerender(<ItemGrid items={SHOWS} layout="list" renderItem={renderShow} />);
    expect(list.className).toContain('ui-item-grid--list');

    rerender(<ItemGrid items={SHOWS} layout="adaptive" renderItem={renderShow} />);
    expect(list.className).toContain('ui-item-grid--adaptive');
  });

  it('puts the column count and gap on the grid CSS custom properties', () => {
    const { container } = render(
      <ItemGrid items={SHOWS} columns={3} gap={24} renderItem={renderShow} />,
    );

    const list = container.querySelector('.ui-item-grid') as HTMLElement;
    expect(list.style.getPropertyValue('--ui-item-grid-cols')).toBe('3');
    expect(list.style.getPropertyValue('--ui-item-grid-gap')).toBe('24px');
  });

  it('defaults the grid to four columns and a 16px gap', () => {
    const { container } = render(<ItemGrid items={SHOWS} renderItem={renderShow} />);

    const list = container.querySelector('.ui-item-grid') as HTMLElement;
    expect(list.style.getPropertyValue('--ui-item-grid-cols')).toBe('4');
    expect(list.style.getPropertyValue('--ui-item-grid-gap')).toBe('16px');
  });

  it('puts the minimum column width on the adaptive layout and keeps columns out of it', () => {
    const { container } = render(
      <ItemGrid items={SHOWS} layout="adaptive" minColumnWidth={320} renderItem={renderShow} />,
    );

    const list = container.querySelector('.ui-item-grid') as HTMLElement;
    expect(list.style.getPropertyValue('--ui-item-grid-min')).toBe('320px');
    expect(list.style.getPropertyValue('--ui-item-grid-cols')).toBe('');
  });

  it('gives every cell the item, so the card owns the cell fill', () => {
    const { container } = render(<ItemGrid items={SHOWS} renderItem={renderShow} />);

    const cells = container.querySelectorAll('.ui-item-grid-cell');
    expect(cells).toHaveLength(SHOWS.length);
    cells.forEach((cell) => {
      expect(cell.querySelector('.ui-card')).not.toBeNull();
    });
  });

  it('keeps the caller className next to the grid classes', () => {
    const { container } = render(
      <ItemGrid items={SHOWS} renderItem={renderShow} className="library-grid" />,
    );

    const list = container.querySelector('.ui-item-grid') as HTMLElement;
    expect(list.className).toContain('ui-item-grid--grid');
    expect(list.className).toContain('library-grid');
  });

  it('renders one full-width cell for the empty state', () => {
    const { container } = render(
      <ItemGrid items={[]} empty={<p>No series yet</p>} renderItem={renderShow} />,
    );

    const cells = container.querySelectorAll('.ui-item-grid-cell');
    expect(cells).toHaveLength(1);
    expect(cells[0]?.className).toContain('ui-item-grid-cell--empty');
    expect(screen.getByText('No series yet')).toBeInTheDocument();
  });

  it('renders one loading card per skeleton cell and no empty state', () => {
    const { container } = render(
      <ItemGrid
        items={[]}
        loading
        skeletonCount={5}
        empty={<p>No series yet</p>}
        renderItem={renderShow}
      />,
    );

    expect(container.querySelectorAll('.ui-item-grid-cell')).toHaveLength(5);
    expect(container.querySelectorAll('.ui-card--loading')).toHaveLength(5);
    expect(container.querySelectorAll('.ui-item-grid-skeleton')).toHaveLength(5);
    expect(screen.queryByText('No series yet')).toBeNull();
  });

  it('defaults the loading grid to eight skeleton cells', () => {
    const { container } = render(<ItemGrid items={SHOWS} loading renderItem={renderShow} />);

    expect(container.querySelectorAll('.ui-item-grid-cell')).toHaveLength(8);
    expect(screen.queryByText('Sousou no Frieren')).toBeNull();
  });

  it('marks the skeleton cards busy so assistive tech announces the wait', () => {
    const { container } = render(<ItemGrid items={[]} loading renderItem={renderShow} />);

    const cards = container.querySelectorAll('.ui-card');
    expect(cards).toHaveLength(8);
    cards.forEach((card) => expect(card.getAttribute('aria-busy')).toBe('true'));
  });
});
