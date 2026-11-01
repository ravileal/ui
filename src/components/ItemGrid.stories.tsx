import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';
import EmptyState from './EmptyState';
import Item from './Item';
import { ItemGrid, type ItemGridLayout } from './ItemGrid';
import { ViewSwitcher } from './ViewSwitcher';

const meta: Meta = {
  title: 'Item grid',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

interface Show {
  id: string;
  title: string;
  studio: string;
  meta: string;
  initials: string;
}

const SHOWS: Show[] = [
  {
    id: 'frieren',
    title: 'Sousou no Frieren',
    studio: 'Madhouse',
    meta: '2023 · 28 eps',
    initials: 'FR',
  },
  {
    id: 'vinland',
    title: 'Vinland Saga',
    studio: 'Wit Studio',
    meta: '2019 · 48 eps',
    initials: 'VS',
  },
  { id: 'chainsaw', title: 'Chainsaw Man', studio: 'MAPPA', meta: '2022 · 12 eps', initials: 'CM' },
  { id: 'mushishi', title: 'Mushishi', studio: 'Artland', meta: '2005 · 26 eps', initials: 'MU' },
  { id: 'monster', title: 'Monster', studio: 'Madhouse', meta: '2004 · 74 eps', initials: 'MO' },
  {
    id: 'ping-pong',
    title: 'Ping Pong the Animation',
    studio: 'Tatsunoko',
    meta: '2014 · 11 eps',
    initials: 'PP',
  },
];

function gridItem(show: Show, mediaPosition: 'top' | 'start') {
  return (
    <Item
      title={show.title}
      subtitle={show.studio}
      meta={show.meta}
      href={`/series/${show.id}`}
      interactive
      mediaPosition={mediaPosition}
      media={{ src: null, initials: show.initials }}
    />
  );
}

export const Grid: Story = {
  render: () => (
    <ItemGrid
      items={SHOWS}
      renderItem={(show) => gridItem(show, 'top')}
      style={{ maxWidth: 960 }}
    />
  ),
};

export const List: Story = {
  render: () => (
    <ItemGrid
      items={SHOWS}
      layout="list"
      renderItem={(show) => gridItem(show, 'start')}
      style={{ maxWidth: 640 }}
    />
  ),
};

/* Adaptive reads its container, not the viewport, so the same set at three
   widths is the honest demo: only the column count changes. */
const ADAPTIVE_WIDTHS = [420, 640, 1000];

/* Mixed footprints: a couple of hero blocks claim two columns and every card
   keeps its own height (cover ratio + how many lines the title wraps to), so
   the only thing holding the mosaic together is the packing. */
interface MosaicItem extends Show {
  span: 1 | 2;
  ratio: string;
}

const MOSAIC: MosaicItem[] = [
  { ...SHOWS[0], span: 2, ratio: '16 / 9' },
  { ...SHOWS[1], span: 1, ratio: '2 / 3' },
  { ...SHOWS[2], span: 1, ratio: '2 / 3' },
  { ...SHOWS[3], span: 1, ratio: '1 / 1' },
  { ...SHOWS[4], span: 2, ratio: '16 / 10' },
  { ...SHOWS[5], span: 1, ratio: '2 / 3' },
  {
    ...SHOWS[0],
    id: 'frieren-2',
    title: "Sousou no Frieren: Beyond Journey's End",
    span: 1,
    ratio: '2 / 3',
  },
  { ...SHOWS[1], id: 'vinland-2', title: 'Vinland Saga', span: 1, ratio: '1 / 1' },
  { ...SHOWS[2], id: 'chainsaw-2', title: 'Chainsaw Man', span: 1, ratio: '2 / 3' },
  { ...SHOWS[3], id: 'mushishi-2', title: 'Mushishi: The Next Passage', span: 2, ratio: '21 / 9' },
  { ...SHOWS[4], id: 'monster-2', title: 'Monster', span: 1, ratio: '2 / 3' },
  { ...SHOWS[5], id: 'ping-pong-2', title: 'Ping Pong the Animation', span: 1, ratio: '1 / 1' },
];

function mosaicItem(item: MosaicItem) {
  return (
    <Item
      title={item.title}
      subtitle={item.studio}
      meta={item.meta}
      href={`/series/${item.id}`}
      interactive
      mediaPosition="top"
      media={{ src: null, initials: item.initials, aspectRatio: item.ratio }}
    />
  );
}

export const Adaptive: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      {ADAPTIVE_WIDTHS.map((width) => (
        <section key={width} style={{ maxWidth: width }}>
          <div style={{ color: 'var(--ui-text-3)', fontSize: 12, marginBottom: 8 }}>
            {width}px container
          </div>
          <ItemGrid
            items={MOSAIC}
            layout="adaptive"
            minColumnWidth={180}
            getSpan={(item) => item.span}
            getKey={(item) => item.id}
            renderItem={mosaicItem}
          />
        </section>
      ))}
    </div>
  ),
};

/** Drag the bottom-right corner: blocks re-pack as the column count changes. */
export const AdaptiveResizing: Story = {
  render: () => (
    <div
      style={{
        width: 420,
        minWidth: 260,
        maxWidth: '100%',
        padding: 12,
        border: '1px dashed var(--ui-border)',
        overflow: 'auto',
        resize: 'horizontal',
      }}
    >
      <ItemGrid
        items={MOSAIC}
        layout="adaptive"
        minColumnWidth={180}
        getSpan={(item) => item.span}
        getKey={(item) => item.id}
        renderItem={mosaicItem}
      />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <ItemGrid
      items={[]}
      loading
      skeletonCount={8}
      renderItem={() => null}
      style={{ maxWidth: 960 }}
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <ItemGrid
      items={[]}
      renderItem={() => null}
      empty={
        <EmptyState title="No series yet" description="Add a series to see it in this grid." />
      }
      style={{ maxWidth: 960 }}
    />
  ),
};

function GridWithSwitcher() {
  const [layout, setLayout] = useState<ItemGridLayout>('grid');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 960 }}>
      {/* The switcher and the primary action share one height: 36px each. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ViewSwitcher value={layout} onChange={setLayout} storageKey="ui-item-grid-story" />
        <Button>Adicionar anime</Button>
      </div>
      <ItemGrid
        items={SHOWS}
        layout={layout}
        renderItem={(show) => gridItem(show, layout === 'list' ? 'start' : 'top')}
      />
    </div>
  );
}

export const WithViewSwitcher: Story = {
  render: () => <GridWithSwitcher />,
};
