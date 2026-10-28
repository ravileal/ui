// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import type { ReactElement } from 'react';
import Avatar from './components/Avatar';
import Checkbox from './components/Checkbox';
import { ColorPicker } from './components/ColorPicker';
import ConfirmModal from './components/ConfirmModal';
import CopyValue from './components/CopyValue';
import DatePicker from './components/DatePicker';
import Dropdown from './components/Dropdown';
import { InlineEditorCard } from './components/InlineEditorCard';
import { ListScreen } from './components/ListScreen';
import Modal from './components/Modal';
import MonthSelector from './components/MonthSelector';
import { NumberStepper } from './components/NumberStepper';
import Radio from './components/Radio';
import { RowActions } from './components/RowActions';
import { PageSkeleton, SkeletonStatus } from './components/ScreenSkeleton';
import Skeleton from './components/Skeleton';
import Tooltip from './components/Tooltip';

const months = [
  { value: '2026-10', label: 'Oct 2026' },
  { value: '2026-09', label: 'Sep 2026' },
];

const cases: Array<[string, ReactElement]> = [
  ['Avatar', <Avatar name="Ravi" color="#4f7cff" />],
  ['Checkbox', <Checkbox aria-label="Check" />],
  ['ColorPicker', <ColorPicker value="#00c9a7" onChange={() => {}} presets={['#00c9a7']} />],
  [
    'ConfirmModal',
    <ConfirmModal
      open
      title="Confirm"
      message="Message"
      onConfirm={() => {}}
      onCancel={() => {}}
    />,
  ],
  ['CopyValue', <CopyValue value={10} ariaLabel="Copy" />],
  ['DatePicker', <DatePicker value="" onChange={() => {}} />],
  [
    'Dropdown',
    <Dropdown
      value=""
      onChange={() => {}}
      options={[{ value: '', label: '—' }]}
      ariaLabel="Option"
    />,
  ],
  [
    'InlineEditorCard',
    <InlineEditorCard title="Edit" onSave={() => {}} onCancel={() => {}}>
      content
    </InlineEditorCard>,
  ],
  [
    'ListScreen',
    <ListScreen title="Title" subtitle="Subtitle">
      content
    </ListScreen>,
  ],
  [
    'Modal',
    <Modal open title="Modal" onClose={() => {}}>
      content
    </Modal>,
  ],
  [
    'MonthSelector',
    <MonthSelector selectedMonth="2026-10" setSelectedMonth={() => {}} options={months} />,
  ],
  ['NumberStepper', <NumberStepper value={1} onChange={() => {}} ariaLabel="Number" />],
  ['Radio', <Radio aria-label="Radio" />],
  ['RowActions', <RowActions onEdit={() => {}} onDelete={() => {}} />],
  [
    'ScreenSkeleton',
    <PageSkeleton label="Loading">
      <SkeletonStatus label="Inner">content</SkeletonStatus>
    </PageSkeleton>,
  ],
  ['Skeleton', <Skeleton />],
  ['Tooltip', <Tooltip content="tip">trigger</Tooltip>],
];

describe('SSR', () => {
  it.each(cases)('renders %s without browser globals', (_name, element) => {
    expect(() => renderToString(element)).not.toThrow();
  });
});
