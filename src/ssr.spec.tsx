// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import type { ReactElement } from 'react';
import Alert from './components/Alert';
import Avatar from './components/Avatar';
import { Badge, Chip } from './components/Badge';
import Button, { IconButton } from './components/Button';
import { Card, CardBody, CardHeader, Section } from './components/Card';
import Checkbox from './components/Checkbox';
import Combobox from './components/Combobox';
import { ColorPicker } from './components/ColorPicker';
import ConfirmModal from './components/ConfirmModal';
import CopyValue from './components/CopyValue';
import { DataTable } from './components/DataTable';
import DatePicker from './components/DatePicker';
import { Drawer } from './components/Drawer';
import Dropdown from './components/Dropdown';
import { DropdownMenu } from './components/DropdownMenu';
import EmptyState from './components/EmptyState';
import { FileUpload } from './components/FileUpload';
import FormField from './components/FormField';
import { InlineEditorCard } from './components/InlineEditorCard';
import { ListScreen } from './components/ListScreen';
import Modal from './components/Modal';
import MonthSelector from './components/MonthSelector';
import { NumberStepper } from './components/NumberStepper';
import PageHeader from './components/PageHeader';
import Portal from './components/Portal';
import ProgressBar from './components/ProgressBar';
import Radio from './components/Radio';
import { RowActions } from './components/RowActions';
import { PageSkeleton, SkeletonStatus } from './components/ScreenSkeleton';
import SearchInput from './components/SearchInput';
import { SegmentedControl } from './components/SegmentedControl';
import Skeleton from './components/Skeleton';
import Slider from './components/Slider';
import Spinner from './components/Spinner';
import Switch from './components/Switch';
import { Tabs } from './components/Tabs';
import TextInput from './components/TextInput';
import Textarea from './components/Textarea';
import { ToastProvider } from './components/Toast';
import Tooltip from './components/Tooltip';
import VisuallyHidden from './components/VisuallyHidden';

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
  ['Alert', <Alert tone="info">Message</Alert>],
  ['Badge', <Badge tone="success">Paid</Badge>],
  ['Chip', <Chip onRemove={() => {}}>Food</Chip>],
  ['Button', <Button>Save</Button>],
  ['IconButton', <IconButton aria-label="Settings">⚙</IconButton>],
  [
    'Card',
    <Card>
      <CardHeader title="Title" />
      <CardBody>Body</CardBody>
    </Card>,
  ],
  ['Section', <Section title="Title">Body</Section>],
  [
    'Combobox',
    <Combobox value="" onChange={() => {}} options={[{ value: 'a', label: 'A' }]} ariaLabel="A" />,
  ],
  [
    'DataTable',
    <DataTable
      ariaLabel="Table"
      columns={[{ key: 'name', header: 'Name' }]}
      rows={[{ name: 'Ravi' }]}
      rowKey={(row) => row.name}
    />,
  ],
  [
    'Drawer',
    <Drawer open onClose={() => {}} title="Drawer">
      content
    </Drawer>,
  ],
  [
    'DropdownMenu',
    <DropdownMenu trigger="Actions" ariaLabel="Actions" items={[{ id: 'edit', label: 'Edit' }]} />,
  ],
  ['EmptyState', <EmptyState title="Empty" />],
  ['FileUpload', <FileUpload onFiles={() => {}} />],
  [
    'FormField',
    <FormField label="Name" hint="Hint">
      <TextInput />
    </FormField>,
  ],
  ['PageHeader', <PageHeader title="Title" subtitle="Subtitle" />],
  [
    'Portal',
    <Portal>
      <span>portal</span>
    </Portal>,
  ],
  ['ProgressBar', <ProgressBar value={50} />],
  ['SearchInput', <SearchInput value="" onChange={() => {}} ariaLabel="Search" />],
  [
    'SegmentedControl',
    <SegmentedControl
      items={[{ value: 'a', label: 'A' }]}
      value="a"
      onChange={() => {}}
      ariaLabel="Segments"
    />,
  ],
  ['Slider', <Slider value={50} onChange={() => {}} label="Split" />],
  ['Spinner', <Spinner />],
  ['Switch', <Switch checked={false} onChange={() => {}} label="Toggle" />],
  [
    'Tabs',
    <Tabs items={[{ id: 'a', label: 'A' }]} value="a" onChange={() => {}} ariaLabel="Tabs" />,
  ],
  ['TextInput', <TextInput aria-label="Input" />],
  ['Textarea', <Textarea aria-label="Textarea" />],
  [
    'ToastProvider',
    <ToastProvider>
      <span>content</span>
    </ToastProvider>,
  ],
  ['VisuallyHidden', <VisuallyHidden>Hidden</VisuallyHidden>],
];

describe('SSR', () => {
  it.each(cases)('renders %s without browser globals', (_name, element) => {
    expect(() => renderToString(element)).not.toThrow();
  });
});
