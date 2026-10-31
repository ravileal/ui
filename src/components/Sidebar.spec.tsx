import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from './Sidebar';
import { setViewportWidth } from '../test-setup';

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

const MOBILE_WIDTH = 390;

function backdrop() {
  return document.querySelector('.ui-sidebar-backdrop');
}

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

  describe('desktop (>= compactBreakpoint)', () => {
    it('renders no backdrop and applies the collapsed width', async () => {
      const onToggle = vi.fn();
      render(
        <Sidebar
          items={items}
          activeId="dashboard"
          onSelect={vi.fn()}
          collapsed
          collapsedWidth={72}
          width={240}
          onToggle={onToggle}
        />,
      );

      const nav = screen.getByRole('navigation', { name: 'Main navigation' });
      expect(nav).toHaveClass('ui-sidebar');
      expect(nav).toHaveClass('is-collapsed');
      expect(nav).not.toHaveClass('is-compact');
      expect(nav).not.toHaveClass('is-open');
      expect(nav).toHaveStyle({ width: '72px' });
      expect(backdrop()).toBeNull();

      await userEvent.click(screen.getByRole('button', { name: 'Expand sidebar' }));
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('applies the expanded width and keeps the « glyph', () => {
      render(
        <Sidebar
          items={items}
          activeId="dashboard"
          onSelect={vi.fn()}
          collapsed={false}
          width={240}
          onToggle={vi.fn()}
        />,
      );

      const nav = screen.getByRole('navigation', { name: 'Main navigation' });
      expect(nav).toHaveStyle({ width: '240px' });
      expect(nav).not.toHaveClass('is-collapsed');
      expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toHaveTextContent('«');
    });

    it('ignores mobileOpen and onMobileClose for selection', async () => {
      const onSelect = vi.fn();
      const onMobileClose = vi.fn();
      render(
        <Sidebar
          items={items}
          activeId="dashboard"
          onSelect={onSelect}
          collapsed={false}
          onToggle={vi.fn()}
          mobileOpen
          onMobileClose={onMobileClose}
        />,
      );

      expect(backdrop()).toBeNull();
      await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
      expect(onSelect).toHaveBeenCalledWith('settings');
      expect(onMobileClose).not.toHaveBeenCalled();
    });
  });

  describe('compact (< compactBreakpoint)', () => {
    it('renders a closed drawer without backdrop', () => {
      setViewportWidth(MOBILE_WIDTH);
      render(
        <Sidebar
          items={items}
          activeId="dashboard"
          onSelect={vi.fn()}
          collapsed={false}
          mobileOpen={false}
          onMobileClose={vi.fn()}
          onToggle={vi.fn()}
        />,
      );

      const nav = screen.getByRole('navigation', { name: 'Main navigation' });
      expect(nav).toHaveClass('ui-sidebar');
      expect(nav).toHaveClass('is-compact');
      expect(nav).not.toHaveClass('is-open');
      expect(nav).not.toHaveClass('is-collapsed');
      expect(backdrop()).toBeNull();
      expect(screen.getByRole('button', { name: 'Close navigation' })).toHaveTextContent('×');
    });

    it('derives the open state from collapsed when mobileOpen is omitted', () => {
      setViewportWidth(MOBILE_WIDTH);
      render(
        <Sidebar
          items={items}
          activeId="dashboard"
          onSelect={vi.fn()}
          collapsed={false}
          onToggle={vi.fn()}
        />,
      );

      expect(screen.getByRole('navigation', { name: 'Main navigation' })).toHaveClass('is-open');
    });

    it('opens full-width labels and a backdrop that closes the drawer', async () => {
      setViewportWidth(MOBILE_WIDTH);
      const onMobileClose = vi.fn();
      render(
        <Sidebar
          items={items}
          activeId="dashboard"
          onSelect={vi.fn()}
          collapsed
          mobileOpen
          onMobileClose={onMobileClose}
          onToggle={vi.fn()}
          brand={{ icon: <span>◆</span>, title: 'App' }}
        />,
      );

      const nav = screen.getByRole('navigation', { name: 'Main navigation' });
      expect(nav).toHaveClass('is-compact');
      expect(nav).toHaveClass('is-open');
      expect(nav).not.toHaveClass('is-collapsed');
      // collapsed is ignored: labels and brand copy stay visible in the drawer.
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('App')).toBeInTheDocument();

      const overlay = backdrop();
      expect(overlay).not.toBeNull();
      expect(overlay).toHaveAttribute('aria-hidden', 'true');

      await userEvent.click(overlay as Element);
      expect(onMobileClose).toHaveBeenCalledTimes(1);
    });

    it('closes after selecting a leaf item', async () => {
      setViewportWidth(MOBILE_WIDTH);
      const onSelect = vi.fn();
      const onMobileClose = vi.fn();
      render(
        <Sidebar
          items={items}
          activeId="dashboard"
          onSelect={onSelect}
          collapsed={false}
          mobileOpen
          onMobileClose={onMobileClose}
          onToggle={vi.fn()}
        />,
      );

      await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
      expect(onSelect).toHaveBeenCalledWith('settings');
      expect(onMobileClose).toHaveBeenCalledTimes(1);
    });

    it('closes after selecting a subitem and keeps group toggles in-body', async () => {
      setViewportWidth(MOBILE_WIDTH);
      const onSelect = vi.fn();
      const onMobileClose = vi.fn();
      const onToggle = vi.fn();
      render(
        <Sidebar
          items={items}
          activeId="dashboard"
          onSelect={onSelect}
          collapsed
          mobileOpen
          onMobileClose={onMobileClose}
          onToggle={onToggle}
        />,
      );

      await userEvent.click(screen.getByRole('button', { name: 'Aliases' }));
      expect(onToggle).not.toHaveBeenCalled();
      expect(screen.getByText('Merchant Aliases')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Merchant Aliases' }));
      expect(onSelect).toHaveBeenCalledWith('merchant');
      expect(onMobileClose).toHaveBeenCalledTimes(1);
    });

    it('closes on Escape while open', () => {
      setViewportWidth(MOBILE_WIDTH);
      const onMobileClose = vi.fn();
      render(
        <Sidebar
          items={items}
          activeId="dashboard"
          onSelect={vi.fn()}
          collapsed={false}
          mobileOpen
          onMobileClose={onMobileClose}
          onToggle={vi.fn()}
        />,
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onMobileClose).toHaveBeenCalledTimes(1);
    });

    it('does not react to Escape while closed', () => {
      setViewportWidth(MOBILE_WIDTH);
      const onMobileClose = vi.fn();
      render(
        <Sidebar
          items={items}
          activeId="dashboard"
          onSelect={vi.fn()}
          collapsed={false}
          mobileOpen={false}
          onMobileClose={onMobileClose}
          onToggle={vi.fn()}
        />,
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onMobileClose).not.toHaveBeenCalled();
    });

    it('locks body scroll while open and restores it on close', () => {
      setViewportWidth(MOBILE_WIDTH);
      document.body.style.overflow = 'scroll';
      const props = {
        items,
        activeId: 'dashboard',
        onSelect: vi.fn(),
        collapsed: false,
        onToggle: vi.fn(),
        onMobileClose: vi.fn(),
      };

      const { rerender } = render(<Sidebar {...props} mobileOpen />);
      expect(document.body.style.overflow).toBe('hidden');

      rerender(<Sidebar {...props} mobileOpen={false} />);
      expect(document.body.style.overflow).toBe('scroll');
      document.body.style.overflow = '';
    });

    it('routes the close button to onMobileClose when open and onToggle when closed', async () => {
      setViewportWidth(MOBILE_WIDTH);
      const onMobileClose = vi.fn();
      const onToggle = vi.fn();
      const props = {
        items,
        activeId: 'dashboard',
        onSelect: vi.fn(),
        collapsed: false,
        onToggle,
        onMobileClose,
        closeLabel: 'Dismiss menu',
      };

      const { rerender } = render(<Sidebar {...props} mobileOpen />);
      await userEvent.click(screen.getByRole('button', { name: 'Dismiss menu' }));
      expect(onMobileClose).toHaveBeenCalledTimes(1);
      expect(onToggle).not.toHaveBeenCalled();

      rerender(<Sidebar {...props} mobileOpen={false} />);
      await userEvent.click(screen.getByRole('button', { name: 'Dismiss menu' }));
      expect(onToggle).toHaveBeenCalledTimes(1);
      expect(onMobileClose).toHaveBeenCalledTimes(1);
    });

    it('honours a custom compactBreakpoint and reacts to viewport changes', () => {
      setViewportWidth(MOBILE_WIDTH);
      render(
        <Sidebar
          items={items}
          activeId="dashboard"
          onSelect={vi.fn()}
          collapsed={false}
          compactBreakpoint={360}
          onToggle={vi.fn()}
        />,
      );

      const nav = screen.getByRole('navigation', { name: 'Main navigation' });
      expect(nav).not.toHaveClass('is-compact');

      act(() => setViewportWidth(320));
      expect(nav).toHaveClass('is-compact');
    });
  });
});
