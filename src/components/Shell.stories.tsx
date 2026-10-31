import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import AppShell, { AppBar } from './AppShell';
import Sidebar, { type SidebarItem } from './Sidebar';

const meta: Meta<typeof AppShell> = {
  title: 'Layout/Shell',
  component: AppShell,
};
export default meta;

type Story = StoryObj<typeof AppShell>;

const navItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M4 13h6V4H4v9Zm10 7h6v-9h-6v9ZM4 20h6v-4H4v4Zm10-11h6V4h-6v5Z" />
      </svg>
    ),
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M4 8h13l-3-3M20 16H7l3 3" />
      </svg>
    ),
  },
  {
    id: 'rules',
    label: 'Rules',
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M5 7h14M5 12h9M5 17h5" />
      </svg>
    ),
  },
  {
    id: 'goals',
    label: 'Goals',
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 4v2m0 12v2M4 12h2m12 0h2M6.5 6.5l1.4 1.4m8.2 8.2 1.4 1.4M17.5 6.5l-1.4 1.4M7.9 16.1l-1.4 1.4" />
      </svg>
    ),
  },
];

function ApplicationShellExample() {
  const [activeId, setActiveId] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        width: 900,
        height: 560,
        border: '1px solid var(--ui-border)',
      }}
    >
      <AppShell
        ariaLabel="Dashboard content"
        title="Dashboard"
        subtitle="October 2026"
        actions={
          <button
            type="button"
            style={{
              padding: '6px 10px',
              border: '1px solid var(--ui-border)',
              borderRadius: 8,
              background: 'var(--ui-surface-2)',
              color: 'var(--ui-text)',
              font: 'inherit',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Export
          </button>
        }
        aside={
          <div
            style={{
              position: 'absolute',
              right: 20,
              bottom: 20,
              padding: '10px 14px',
              borderRadius: 999,
              background: 'var(--ui-accent)',
              color: 'var(--ui-on-accent)',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Ask
          </div>
        }
        sidebar={({ mobileOpen, onMobileClose }) => (
          <Sidebar
            items={navItems}
            activeId={activeId}
            onSelect={(id) => {
              setActiveId(id);
              onMobileClose();
            }}
            collapsed={collapsed}
            onToggle={() => setCollapsed((current) => !current)}
            mobileOpen={mobileOpen}
            onMobileClose={onMobileClose}
            brand={{ icon: <span>◆</span>, title: 'Budget', subtitle: 'Household' }}
            footer={(rail) => (
              <button
                type="button"
                style={{
                  width: '100%',
                  padding: rail ? '8px 0' : '8px 12px',
                  border: '1px solid var(--ui-border)',
                  borderRadius: 8,
                  background: 'var(--ui-surface-2)',
                  color: 'var(--ui-text-2)',
                  font: 'inherit',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {rail ? '☀' : 'Toggle theme'}
              </button>
            )}
          />
        )}
      >
        <div style={{ padding: 24, overflow: 'auto' }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Dashboard</h2>
          <p style={{ margin: '6px 0 18px', color: 'var(--ui-text-3)', fontSize: 13 }}>
            Resize the preview below 640px: the sidebar becomes a drawer and the compact bar appears
            with the trigger that reopens it.
          </p>
          <div style={{ display: 'grid', gap: 12 }}>
            {['Spending this month', 'Savings goal', 'Upcoming bills'].map((label) => (
              <div
                key={label}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: 'var(--ui-surface)',
                  border: '1px solid var(--ui-border)',
                  fontSize: 13,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    </div>
  );
}

export const ApplicationShell: Story = {
  render: () => <ApplicationShellExample />,
};

export const CompactBar: Story = {
  render: () => (
    <div style={{ width: 390, border: '1px solid var(--ui-border)' }}>
      <AppBar
        title="Transactions"
        subtitle="October 2026"
        navLabel="Open navigation"
        onNavClick={() => {}}
        actions={
          <button
            type="button"
            style={{
              padding: '6px 10px',
              border: '1px solid var(--ui-border)',
              borderRadius: 8,
              background: 'var(--ui-surface-2)',
              color: 'var(--ui-text)',
              font: 'inherit',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Filter
          </button>
        }
      />
    </div>
  ),
};
