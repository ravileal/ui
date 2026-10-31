import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
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

export const Adaptive: Story = {
  render: () => (
    <ItemGrid
      items={SHOWS}
      layout="adaptive"
      minColumnWidth={180}
      renderItem={(show) => gridItem(show, 'top')}
      style={{ maxWidth: 960 }}
    />
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
      <ViewSwitcher value={layout} onChange={setLayout} storageKey="ui-item-grid-story" />
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
