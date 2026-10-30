import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from './Sidebar';

const items = [
  { id: 'dashboard', label: 'Dashboard', icon: <span>▦</span> },
  {
    id: 'aliases',
    label: 'Aliases',
    icon: <span>◇</span>,
    children: [
      { id: 'merchant', label: 'Merchant Aliases' },
      { id: 'payment', label: 'Payment Aliases' },
    ],
  },
  { id: 'settings', label: 'Settings' },
];

describe('Sidebar', () => {
  it('renders items and navigates on click', async () => {
    const onSelect = vi.fn();
    render(
      <Sidebar
        items={items}
        activeId="dashboard"
        onSelect={onSelect}
        collapsed={false}
        onToggle={vi.fn()}
        brand={{ icon: <span>◆</span>, title: 'App', subtitle: 'Team' }}
      />,
    );

    expect(screen.getByText('App')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(onSelect).toHaveBeenCalledWith('settings');
  });

  it('expands the active group and navigates to its children', async () => {
    const onSelect = vi.fn();
    render(
      <Sidebar
        items={items}
        activeId="merchant"
        onSelect={onSelect}
        collapsed={false}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByText('Merchant Aliases')).toBeInTheDocument();
    const group = screen.getByRole('button', { name: 'Aliases' });
    expect(group).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(screen.getByRole('button', { name: 'Payment Aliases' }));
    expect(onSelect).toHaveBeenCalledWith('payment');
  });

  it('toggles a group open and closed', async () => {
    render(
      <Sidebar
        items={items}
        activeId="dashboard"
        onSelect={vi.fn()}
        collapsed={false}
        onToggle={vi.fn()}
      />,
    );

    const group = screen.getByRole('button', { name: 'Aliases' });
    expect(screen.queryByText('Merchant Aliases')).not.toBeInTheDocument();
    await userEvent.click(group);
    expect(screen.getByText('Merchant Aliases')).toBeInTheDocument();
    await userEvent.click(group);
    expect(screen.queryByText('Merchant Aliases')).not.toBeInTheDocument();
  });

  it('hides labels when collapsed, expands the rail on group click and renders the footer slot', async () => {
    const onToggle = vi.fn();
    render(
      <Sidebar
        items={items}
        activeId="dashboard"
        onSelect={vi.fn()}
        collapsed
        onToggle={onToggle}
        brand={{ icon: <span>◆</span>, title: 'App' }}
        footer={(collapsed) => <span>{collapsed ? 'collapsed footer' : 'expanded footer'}</span>}
      />,
    );

    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('App')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();
    expect(screen.getByTitle('Settings')).toBeInTheDocument();

    await userEvent.click(screen.getByTitle('Aliases'));
    expect(onToggle).toHaveBeenCalled();
    expect(screen.getByText('collapsed footer')).toBeInTheDocument();
  });

  it('calls onToggle from the collapse button', async () => {
    const onToggle = vi.fn();
    render(
      <Sidebar
        items={items}
        activeId="dashboard"
        onSelect={vi.fn()}
        collapsed={false}
        onToggle={onToggle}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(onToggle).toHaveBeenCalled();
  });
});
