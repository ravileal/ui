import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Avatar from './Avatar';
import { InlineEditorCard } from './InlineEditorCard';
import { ListCard, ListEmptyState, ListRow, ListScreen } from './ListScreen';
import { RowActions } from './RowActions';
import { ListCardSkeleton, PageSkeleton } from './ScreenSkeleton';
import Skeleton from './Skeleton';
import TextInput from './TextInput';

const meta: Meta = {
  title: 'Foundations',
};
export default meta;

type Story = StoryObj;

export const AvatarStory: Story = {
  name: 'Avatar',
  render: () => <Avatar name="Ravi" color="#4f7cff" />,
};

export const SkeletonStory: Story = {
  name: 'Skeleton',
  render: () => (
    <div style={{ display: 'grid', gap: 10 }}>
      <Skeleton width={180} height={16} />
      <Skeleton width={120} height={12} />
      <Skeleton width={40} height={40} circle />
    </div>
  ),
};

export const PageSkeletonStory: Story = {
  name: 'ScreenSkeleton',
  render: () => (
    <div style={{ width: 520 }}>
      <PageSkeleton label="Loading list">
        <ListCardSkeleton rows={4} />
      </PageSkeleton>
    </div>
  ),
};

export const ListScreenStory: Story = {
  name: 'ListScreen',
  render: () => (
    <div style={{ width: 620, height: 420 }}>
      <ListScreen
        title="Aliases"
        subtitle="Description aliases"
        action={{ label: 'New alias', onClick: () => {} }}
      >
        <ListCard>
          <ListRow>Groceries · Food</ListRow>
          <ListRow borderBottom={false}>
            <ListEmptyState>No more aliases</ListEmptyState>
          </ListRow>
        </ListCard>
      </ListScreen>
    </div>
  ),
};

export const RowActionsStory: Story = {
  name: 'RowActions',
  render: () => <RowActions onEdit={() => {}} onDelete={() => {}} />,
};

function InlineEditorExample() {
  const [value, setValue] = useState('Food');
  return (
    <InlineEditorCard title="Edit alias" onSave={() => {}} onCancel={() => {}}>
      <TextInput aria-label="Alias" value={value} onChange={(event) => setValue(event.target.value)} />
    </InlineEditorCard>
  );
}

export const InlineEditorCardStory: Story = {
  name: 'InlineEditorCard',
  render: () => <InlineEditorExample />,
};
