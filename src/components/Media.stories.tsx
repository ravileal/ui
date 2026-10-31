import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';
import { Card } from './Card';
import MediaCard from './MediaCard';
import MediaThumb from './MediaThumb';
import MetaList from './MetaList';
import NumberField from './NumberField';
import { ResultList, ResultRow } from './ResultList';
import Switch from './Switch';

const meta: Meta = {
  title: 'Media',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

function ThumbExample() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <MediaThumb
        src="https://placehold.co/300x450/png"
        initials="FR"
        size="xs"
        alt="Cover thumbnail"
      />
      <MediaThumb src="https://placehold.co/300x450/png" initials="FR" size="sm" alt="" />
      <MediaThumb src={null} initials="FR" size="md" />
    </div>
  );
}

function CardExample() {
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
      <Card padding="sm" style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <MediaCard
          coverImage="https://placehold.co/300x450/png"
          initials="FR"
          title="Sousou no Frieren"
          titleHref="/series/frieren"
          meta="2023 · 28 episodes"
          footer={
            <Switch
              size="sm"
              checked={monitored}
              onChange={setMonitored}
              label="Monitored"
              ariaLabel="Monitor series"
            />
          }
          style={{ flex: 1 }}
        />
      </Card>
      <Card padding="sm" style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <MediaCard
          coverImage={null}
          initials="VS"
          title="Vinland Saga: Farm Arc, Collector's Edition Box Set"
          titleHref="/series/vinland-saga"
          meta="2019 · 48 episodes"
          footer={
            <Switch
              size="sm"
              checked={false}
              onChange={() => {}}
              label="Monitored"
              ariaLabel="Monitor Vinland Saga"
            />
          }
          style={{ flex: 1 }}
        />
      </Card>
    </div>
  );
}

function HorizontalCardExample() {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 390 }}
    >
      <MediaCard
        orientation="horizontal"
        coverImage="https://placehold.co/300x450/png"
        initials="FR"
        title="Sousou no Frieren"
        titleHref="/series/frieren"
        meta="2023 · 28 episodes"
      />
      <MediaCard
        orientation="horizontal"
        coverImage={null}
        initials="VS"
        title="Vinland Saga"
        titleHref="/series/vinland-saga"
        meta="2019 · 48 episodes"
      />
    </div>
  );
}

function ResultListExample() {
  return (
    <div style={{ width: '100%', maxWidth: 390 }}>
      <ResultList ariaLabel="Search results" emptyLabel="No series found">
        <ResultRow
          media={{ src: null, initials: 'FR' }}
          primary="Frieren"
          secondary={['Sousou no Frieren', 'Madhouse']}
          meta="2023"
          action={
            <Button size="sm" variant="secondary">
              Add
            </Button>
          }
        />
        <ResultRow
          media={{ src: null, initials: 'VS' }}
          primary="Vinland Saga"
          secondary={[
            'Vinland Saga: Farm Arc, Collector’s Edition Box Set (Director’s Cut)',
            'Wit Studio · 24 episodes · TV-MA',
          ]}
          meta="2019 · 24 episodes · Finished airing"
          action={
            <Button size="sm" variant="secondary">
              Add
            </Button>
          }
        />
        <ResultRow
          media={{ src: null, initials: 'CS' }}
          primary="Chainsaw Man"
          secondary={['Chainsaw Man', 'MAPPA']}
          meta="2022"
          action={
            <Button size="sm" variant="secondary">
              Add
            </Button>
          }
        />
      </ResultList>
    </div>
  );
}

function MetaListExample() {
  return (
    <div style={{ width: '100%', maxWidth: 390 }}>
      <MetaList
        separator
        ariaLabel="Series details"
        items={[
          { label: 'Year', value: '2023' },
          { label: 'Episodes', value: '28' },
          { label: 'Status', value: 'Finished', tone: 'muted' },
          { label: 'Score', value: '8.9' },
          { label: 'Hash', value: '8f1c2b9d4e7a6053', mono: true },
          { label: 'Source', value: 'Missing', tone: 'danger' },
        ]}
      />
    </div>
  );
}

function NumberFieldExample() {
  const [group, setGroup] = useState(25);
  const [resolution, setResolution] = useState(-100);
  const [offset, setOffset] = useState(0);
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 12,
        width: '100%',
        maxWidth: 320,
      }}
    >
      <NumberField label="Group" value={group} onChange={setGroup} min={-100} max={100} />
      <NumberField
        label="Resolution"
        value={resolution}
        onChange={setResolution}
        min={-100}
        max={100}
      />
      <NumberField
        label="Offset"
        labelHidden
        value={offset}
        onChange={setOffset}
        min={-100}
        max={100}
      />
    </div>
  );
}

export const MediaThumbStory: Story = {
  name: 'MediaThumb',
  render: () => <ThumbExample />,
};

export const MediaCardStory: Story = {
  name: 'MediaCard',
  render: () => <CardExample />,
};

export const MediaCardHorizontalStory: Story = {
  name: 'MediaCardHorizontal',
  render: () => <HorizontalCardExample />,
};

export const ResultListStory: Story = {
  name: 'ResultList',
  render: () => <ResultListExample />,
};

export const MetaListStory: Story = {
  name: 'MetaList',
  render: () => <MetaListExample />,
};

export const NumberFieldStory: Story = {
  name: 'NumberField',
  render: () => <NumberFieldExample />,
};
