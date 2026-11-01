import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
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

/**
 * The adaptive layout reads its container and each block's own height, so the
 * spec has to own both: `getBoundingClientRect` supplies the width on the list
 * and the height on each card, and the observer stub fires on observe.
 */
describe('ItemGrid adaptive packing', () => {
  interface Row {
    id: string;
    h: number;
    span?: 1 | 2;
  }

  const ROWS: Row[] = [
    { id: 'a', h: 100, span: 2 },
    { id: 'b', h: 200 },
    { id: 'c', h: 60 },
  ];

  let containerWidth = 0;
  let rectSpy: ReturnType<typeof vi.spyOn> | undefined;

  class ResizeObserverStub {
    private readonly callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    observe(target: Element) {
      this.callback([{ target } as ResizeObserverEntry], this as unknown as ResizeObserver);
    }
    unobserve() {}
    disconnect() {}
  }

  function layoutAt(width: number) {
    containerWidth = width;
    rectSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const w = this.classList.contains('ui-item-grid') ? containerWidth : 0;
        const h = Number(this.dataset.h ?? 0);
        return {
          width: w,
          height: h,
          top: 0,
          left: 0,
          right: w,
          bottom: h,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        } as DOMRect;
      });
  }

  function renderAdaptive(props: Partial<ComponentProps<typeof ItemGrid<Row>>> = {}) {
    return render(
      <ItemGrid
        items={ROWS}
        layout="adaptive"
        getKey={(row) => row.id}
        minColumnWidth={200}
        getSpan={(row) => row.span ?? 1}
        renderItem={(row) => <div data-h={row.h}>{row.id}</div>}
        {...props}
      />,
    );
  }

  function cells(container: HTMLElement) {
    return Array.from(container.querySelectorAll<HTMLElement>('.ui-item-grid-cell'));
  }

  const originalObserver = globalThis.ResizeObserver;

  beforeEach(() => {
    // Written directly: the test setup defines the mock as writable but not
    // configurable, so `vi.stubGlobal` cannot replace it.
    (globalThis as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub;
  });

  afterEach(() => {
    rectSpy?.mockRestore();
    (globalThis as { ResizeObserver: unknown }).ResizeObserver = originalObserver;
  });

  it('takes the column count from the container, not the viewport', () => {
    layoutAt(1000);
    const { container } = renderAdaptive();

    // (1000 + 16) / (200 + 16) = 4.7 → four columns.
    expect(container.querySelector('.ui-item-grid')).toHaveAttribute('data-cols', '4');
  });

  it('honours maxColumns even when the container could fit more', () => {
    layoutAt(1600);
    const { container } = renderAdaptive({ maxColumns: 3 });

    expect(container.querySelector('.ui-item-grid')).toHaveAttribute('data-cols', '3');
  });

  it('gives a wide block two columns only when the container can hold them', () => {
    layoutAt(1000);
    const wide = renderAdaptive();
    expect(cells(wide.container)[0]?.style.getPropertyValue('--ui-item-cell-cols')).toBe('2');
    expect(cells(wide.container)[1]?.style.getPropertyValue('--ui-item-cell-cols')).toBe('1');
    wide.unmount();

    layoutAt(150);
    const narrow = renderAdaptive();
    expect(narrow.container.querySelector('.ui-item-grid')).toHaveAttribute('data-cols', '1');
    expect(cells(narrow.container)[0]?.style.getPropertyValue('--ui-item-cell-cols')).toBe('1');
  });

  it('snaps every block to the rows its own height needs and packs densely', () => {
    layoutAt(1000);
    const { container } = renderAdaptive({ gap: 16, rowHeight: 4 });

    const list = container.querySelector('.ui-item-grid');
    expect(list).toHaveAttribute('data-masonry', 'true');
    // ceil((h + 16) / (4 + 16)): 100 → 6, 200 → 11, 60 → 4.
    expect(cells(container).map((cell) => cell.style.getPropertyValue('--ui-item-cell-rows'))).toEqual(
      ['6', '11', '4'],
    );
  });

  it('keeps plain rows while the container has no measured width', () => {
    layoutAt(0);
    const { container } = renderAdaptive();

    const list = container.querySelector('.ui-item-grid');
    expect(list).not.toHaveAttribute('data-cols');
    expect(list).not.toHaveAttribute('data-masonry');
    expect(cells(container)[0]?.style.getPropertyValue('--ui-item-cell-cols')).toBe('1');
  });
});
