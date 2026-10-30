import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import BulkActionBar from './BulkActionBar';
import Button from './Button';
import CodeViewer from './CodeViewer';
import FormField from './FormField';
import FormModal from './FormModal';
import IssueList from './IssueList';
import MonthCalendar from './MonthCalendar';
import ProgressStatusPanel from './ProgressStatusPanel';
import RegexField from './RegexField';
import Sidebar, { type SidebarItem } from './Sidebar';
import StatCard from './StatCard';
import TagInput from './TagInput';
import TextInput from './TextInput';

const meta: Meta = {
  title: 'Patterns',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

function TagInputExample() {
  const [tags, setTags] = useState(['UBER', '99*', 'IFOOD']);
  return (
    <div style={{ width: 420 }}>
      <TagInput
        label="Merchant patterns"
        hint="Add one pattern per raw merchant name."
        value={tags}
        onChange={setTags}
        addLabel="＋ Add pattern"
        placeholder="e.g. Whole Foods Market"
      />
    </div>
  );
}

function FormModalExample() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open form modal</Button>
      <FormModal
        open={open}
        title="New event"
        onClose={() => setOpen(false)}
        onSubmit={() => setOpen(false)}
        error={undefined}
        maxWidth={520}
      >
        <FormField label="Name">
          <TextInput placeholder="e.g. Viagem" />
        </FormField>
        <FormField label="Description" hint="Optional">
          <TextInput placeholder="e.g. Praia" />
        </FormField>
      </FormModal>
    </>
  );
}

function RangeCalendarExample() {
  const [range, setRange] = useState({ startDate: '2026-05-01', endDate: '2026-05-04' });
  return (
    <div style={{ width: 640 }}>
      <MonthCalendar
        mode="range"
        startDate={range.startDate}
        endDate={range.endDate}
        initialMonth="2026-05"
        onChange={setRange}
        formatRange={(startDate, endDate) => `${startDate} → ${endDate || startDate}`}
      />
    </div>
  );
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <span>▦</span> },
  { id: 'transactions', label: 'Transactions', icon: <span>≡</span> },
  {
    id: 'aliases',
    label: 'Aliases',
    icon: <span>◇</span>,
    children: [
      { id: 'merchant-aliases', label: 'Merchant Aliases' },
      { id: 'payment-aliases', label: 'Payment Aliases' },
    ],
  },
  { id: 'settings', label: 'Settings', icon: <span>⚙</span> },
];

function SidebarExample() {
  const [activeId, setActiveId] = useState('transactions');
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{ display: 'flex', height: 560, overflow: 'hidden', borderRadius: 12 }}>
      <Sidebar
        items={SIDEBAR_ITEMS}
        activeId={activeId}
        onSelect={setActiveId}
        collapsed={collapsed}
        onToggle={() => setCollapsed((current) => !current)}
        brand={{ icon: <span>◆</span>, title: 'CoupleFinance', subtitle: 'Ravi & Keri' }}
        footer={(isCollapsed) => (
          <span style={{ color: 'var(--ui-text-2)', fontSize: 12 }}>
            {isCollapsed ? '◐' : 'Footer slot'}
          </span>
        )}
        style={{ height: 560, minHeight: 560 }}
      />
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--ui-bg)',
          color: 'var(--ui-text-2)',
          fontSize: 13,
        }}
      >
        Active: {activeId}
      </div>
    </div>
  );
}

export const TagInputStory: Story = { name: 'TagInput', render: () => <TagInputExample /> };

export const FormModalStory: Story = {
  name: 'FormModal',
  parameters: { layout: 'fullscreen' },
  render: () => <FormModalExample />,
};

export const MonthCalendarStory: Story = {
  name: 'MonthCalendar (view)',
  render: () => (
    <div style={{ width: 640 }}>
      <MonthCalendar
        mode="view"
        initialMonth="2026-05"
        events={[
          { id: 'trip', name: 'Trip', startDate: '2026-05-01', endDate: '2026-05-04' },
          { id: 'show', name: 'Show', startDate: '2026-05-14', endDate: '2026-05-14' },
          { id: 'dentist', name: 'Dentist', startDate: '2026-05-21', endDate: '2026-05-21' },
        ]}
      />
    </div>
  ),
};

export const MonthCalendarRangeStory: Story = {
  name: 'MonthCalendar (range)',
  render: () => <RangeCalendarExample />,
};

export const SidebarStory: Story = {
  name: 'Sidebar',
  parameters: { layout: 'fullscreen' },
  render: () => <SidebarExample />,
};

export const BulkActionBarStory: Story = {
  name: 'BulkActionBar',
  render: () => (
    <div
      style={{
        position: 'relative',
        width: 900,
        height: 160,
        border: '1px dashed var(--ui-border)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <BulkActionBar
        count={3}
        summary={
          <>
            <span>Total: $180.00</span>
            <span>Split: $90.00 / $90.00</span>
          </>
        }
        onClear={() => {}}
        actions={[
          { key: 'total', label: '⎘ Total', onClick: () => {} },
          { key: 'split', label: '⎘ Split ÷2', onClick: () => {}, active: true },
        ]}
        dangerAction={{ label: 'Delete 3', onClick: () => {} }}
      >
        <span style={{ fontSize: 12, color: 'var(--ui-text-2)' }}>Assign:</span>
        <Button size="sm" variant="secondary">
          ÷
        </Button>
        <Button size="sm" variant="secondary">
          R
        </Button>
        <Button size="sm" variant="secondary">
          K
        </Button>
      </BulkActionBar>
    </div>
  ),
};

export const ProgressStatusPanelStory: Story = {
  name: 'ProgressStatusPanel',
  render: () => (
    <div style={{ width: 520 }}>
      <ProgressStatusPanel
        title="Parsing invoices…"
        percent={66}
        progressLabel="Invoice search progress"
        items={[
          { id: 'nubank', label: 'Nubank', status: 'done', detail: '12 lines' },
          { id: 'itau', label: 'Itau', status: 'running', detail: 'Parsing 2/3 PDFs' },
          { id: 'inter', label: 'Inter', status: 'pending', detail: 'Waiting' },
        ]}
      />
    </div>
  ),
};

export const StatCardStory: Story = {
  name: 'StatCard',
  render: () => (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr', width: 620 }}>
      <StatCard
        variant="hero"
        label="Total Spent"
        value="$1,240.00"
        hint="+$120.00 vs last month"
        hintColor="var(--ui-red)"
        accent="var(--ui-accent)"
      />
      <StatCard
        variant="hero"
        label="Ravi's Spending"
        value="$620.00"
        hint="50% of total"
        hintColor="var(--ui-blue)"
        accent="var(--ui-blue)"
        media={<span>R</span>}
      />
    </div>
  ),
};

export const CodeViewerStory: Story = {
  name: 'CodeViewer',
  render: () => (
    <div style={{ width: 560 }}>
      <CodeViewer
        ariaLabel="Invoice parse trace"
        lines={[
          { number: 1, text: '05/01 MERCADO XYZ R$ 120,00', tone: 'success', badge: 'parsed' },
          { number: 2, text: '05/02 FARMACIA ABC R$ 45,90', tone: 'warning', badge: 'review' },
          {
            number: 3,
            text: 'Total a pagar R$ 1.240,00',
            tone: 'danger',
            badge: 'ignored',
            muted: true,
          },
        ]}
      />
    </div>
  ),
};

export const IssueListStory: Story = {
  name: 'IssueList',
  render: () => (
    <div style={{ width: 520 }}>
      <IssueList
        title="Validation"
        issues={[
          { path: 'sources[0].query', message: 'Query is required', onSelect: () => {} },
          { path: 'layouts[1].priority', message: 'Priority must be unique', tone: 'warning' },
        ]}
      />
    </div>
  ),
};

function RegexFieldExample() {
  const [pattern, setPattern] = useState('(?<amount>R\\$\\s*[\\d.,]+)');
  const [flags, setFlags] = useState('i');
  return (
    <div style={{ width: 560 }}>
      <RegexField
        label="Amount pattern"
        value={pattern}
        onChange={(next) => setPattern(next)}
        flags={flags}
        onFlagsChange={setFlags}
        requiredGroups={['amount']}
        sampleText="MERCADO XYZ R$ 120,00"
        presets={[
          {
            id: 'currency',
            label: 'Currency amount',
            pattern: '(?<amount>R\\$\\s*[\\d.,]+)',
            flags: 'i',
          },
          {
            id: 'date',
            label: 'Date',
            pattern: '(?<date>\\d{2}/\\d{2})',
          },
        ]}
      />
    </div>
  );
}

export const RegexFieldStory: Story = { name: 'RegexField', render: () => <RegexFieldExample /> };
