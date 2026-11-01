import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';
import Item from './Item';
import { ItemGrid } from './ItemGrid';
import Switch from './Switch';

const meta: Meta<typeof Item> = {
  title: 'Item',
  component: Item,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Item>;

const FREIREN = {
  src: 'https://placehold.co/300x450/png',
  initials: 'FR',
  alt: 'Sousou no Frieren cover',
};

export const ListRow: Story = {
  args: {
    title: 'Sousou no Frieren',
    subtitle: 'Madhouse',
    meta: '2023 · 28 episodes',
    media: FREIREN,
    href: '/series/frieren',
    actions: (
      <Button size="sm" variant="secondary">
        Monitor
      </Button>
    ),
  },
};

export const GridCell: Story = {
  args: {
    title: 'Vinland Saga',
    subtitle: 'Wit Studio',
    meta: '2019 · 48 episodes',
    media: { src: null, initials: 'VS', fallback: 'initials' },
    mediaPosition: 'top',
    href: '/series/vinland-saga',
  },
  render: (args) => (
    <div style={{ width: 200 }}>
      <Item {...args} />
    </div>
  ),
};

export const TextOnly: Story = {
  args: {
    title: 'Chainsaw Man',
    subtitle: 'MAPPA',
    meta: '2022 · 12 episodes',
    media: { src: null, fallback: 'none' },
    href: '/series/chainsaw-man',
  },
};

export const WithFooter: Story = {
  args: {
    ...ListRow.args,
    selected: true,
    footer: (
      <>
        <Button size="sm" variant="ghost">
          Details
        </Button>
        <Button size="sm">Open</Button>
      </>
    ),
  },
};

export const Sizes: Story = {
  render: () => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 420 }}
    >
      <Item size="sm" title="Small item" subtitle="12px title / 10px padding" media={FREIREN} />
      <Item size="md" title="Medium item" subtitle="14px title / 12px padding" media={FREIREN} />
      <Item size="lg" title="Large item" subtitle="16px title / 16px padding" media={FREIREN} />
    </div>
  ),
};

export const Loading: Story = {
  args: {
    ...ListRow.args,
    loading: true,
  },
};

/**
 * The library card: cover above the text, one meta line and the monitored switch
 * in the footer. Both cards share a grid row, so the footers line up even though
 * one title wraps to three lines.
 */
function LibraryCardExample() {
  const [monitored, setMonitored] = useState(true);
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 12,
        width: '100%',
        maxWidth: 390,
      }}
    >
      <Item
        media={FREIREN}
        mediaPosition="top"
        title="Sousou no Frieren"
        meta="2023 · 28 episodes"
        href="/series/frieren"
        footer={
          <Switch
            size="sm"
            checked={monitored}
            onChange={setMonitored}
            label="Monitorado"
            ariaLabel="Monitorar Sousou no Frieren"
          />
        }
        interactive
      />
      <Item
        media={{ src: null, initials: 'VS' }}
        mediaPosition="top"
        title="Vinland Saga: Farm Arc, Collector's Edition Box Set"
        meta="2019 · 48 episodes"
        href="/series/vinland-saga"
        footer={
          <Switch
            size="sm"
            checked={false}
            onChange={() => {}}
            label="Monitorado"
            ariaLabel="Monitorar Vinland Saga"
          />
        }
        interactive
      />
    </div>
  );
}

export const LibraryCard: Story = {
  render: () => <LibraryCardExample />,
};

/** Bookmark glyph for the poster chip; the kit ships no icon dependency. */
function BookmarkGlyph({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M6 3h12v18l-6-4-6 4z" />
    </svg>
  );
}

const POSTER_ITEMS = [
  {
    key: 'frieren',
    title: 'Sousou no Frieren',
    meta: 'TV · 2023 · 28 eps',
    monitored: true,
    initials: 'SF',
  },
  {
    key: 'vinland',
    title: 'Vinland Saga',
    meta: 'TV · 2019 · 48 eps',
    monitored: true,
    initials: 'VS',
  },
  {
    key: 'bocchi',
    title: 'Bocchi the Rock!',
    meta: 'TV · 2022 · 12 eps',
    monitored: false,
    initials: 'BR',
  },
  { key: 'hako', title: 'Ao no Hako', meta: 'TV · 2024 · 24 eps', monitored: true, initials: 'AH' },
  {
    key: 'kusuriya',
    title: 'Kusuriya no Hitorigoto 3rd Season',
    meta: 'TV · 2026 · 12 eps',
    monitored: true,
    initials: 'KH',
  },
  {
    key: 'seihantai',
    title: 'Seihantai na Kimi to Boku',
    meta: 'TV · 2025 · 12 eps',
    monitored: false,
    initials: 'SK',
  },
];

function PosterCard({
  title,
  meta,
  monitored,
  initials,
  src,
}: {
  title: string;
  meta: string;
  monitored: boolean;
  initials: string;
  src?: string | null;
}) {
  return (
    <Item
      variant="poster"
      media={{ src: src ?? null, initials }}
      title={title}
      meta={meta}
      href={`/series/${initials.toLowerCase()}`}
      badge={
        <span style={{ color: monitored ? 'var(--ui-accent)' : 'var(--ui-text-3)' }}>
          <BookmarkGlyph filled={monitored} />
        </span>
      }
      interactive
    />
  );
}

/**
 * The poster variant against the surface card it grows out of, then the same
 * poster grid at the container widths that change its column count. The
 * variant's claim is that the cover is the card — no surface, no padding, the
 * chip on the corner — so the comparison and the widths are the proof.
 */
export const PosterGallery: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 1120 }}>
      <div>
        <div style={{ marginBottom: 8, color: 'var(--ui-text-3)', fontSize: 12 }}>
          surface card (mediaPosition=&quot;top&quot;) beside poster card — same data
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ width: 200 }}>
            <Item
              media={FREIREN}
              mediaPosition="top"
              title="Sousou no Frieren"
              meta="TV · 2023 · 28 eps"
              href="/series/frieren"
              interactive
            />
          </div>
          <div style={{ width: 200 }}>
            <PosterCard {...POSTER_ITEMS[0]!} src={FREIREN.src} />
          </div>
        </div>
      </div>

      {[420, 720, 1080].map((width) => (
        <div key={width}>
          <div style={{ marginBottom: 8, color: 'var(--ui-text-3)', fontSize: 12 }}>
            {width}px container
          </div>
          <div style={{ width, maxWidth: '100%' }}>
            <ItemGrid
              items={POSTER_ITEMS}
              layout="adaptive"
              minColumnWidth={180}
              gap={20}
              getKey={(item) => item.key}
              renderItem={(item) => <PosterCard {...item} />}
            />
          </div>
        </div>
      ))}
    </div>
  ),
};
