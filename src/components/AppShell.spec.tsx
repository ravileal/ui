import { describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppShell, { type AppShellDrawerState } from './AppShell';
import { setViewportWidth } from '../test-setup';

const MOBILE_WIDTH = 390;
const DESKTOP_WIDTH = 1024;

/** Render prop that always reads `sidebar` as a function and exposes its state. */
function makeDrawer(state: { current: AppShellDrawerState | null }) {
  return (drawer: AppShellDrawerState) => {
    state.current = drawer;
    return (
      <div data-testid="sidebar" data-mobile-open={String(drawer.mobileOpen)}>
        <button type="button" onClick={drawer.onMobileClose}>
          Close drawer
        </button>
      </div>
    );
  };
}

function drawerState() {
  const element = screen.getByTestId('sidebar');
  return element.getAttribute('data-mobile-open');
}

describe('AppShell', () => {
  it('renders the sidebar slot, the children and the aside slot', () => {
    render(
      <AppShell sidebar={<div data-testid="static-sidebar">nav</div>} aside={<div>chat</div>}>
        <p>Page body</p>
      </AppShell>,
    );

    expect(screen.getByTestId('static-sidebar')).toBeInTheDocument();
    expect(screen.getByText('Page body')).toBeInTheDocument();
    expect(screen.getByText('chat')).toBeInTheDocument();
  });

  it('labels the main landmark and exposes the drawer state to the render prop', () => {
    const state: { current: AppShellDrawerState | null } = { current: null };
    render(
      <AppShell sidebar={makeDrawer(state)} ariaLabel="Dashboard content">
        <p>Page body</p>
      </AppShell>,
    );

    expect(screen.getByRole('main', { name: 'Dashboard content' })).toBeInTheDocument();
    expect(state.current?.mobileOpen).toBe(false);
    expect(typeof state.current?.onMobileOpen).toBe('function');
    expect(typeof state.current?.onMobileClose).toBe('function');
  });

  describe('compact (< compactBreakpoint)', () => {
    it('renders the compact bar and opens the drawer from its trigger', async () => {
      setViewportWidth(MOBILE_WIDTH);
      const state: { current: AppShellDrawerState | null } = { current: null };
      render(
        <AppShell sidebar={makeDrawer(state)} title="Dashboard">
          <p>Page body</p>
        </AppShell>,
      );

      expect(document.querySelector('.ui-app-bar')).not.toBeNull();
      expect(drawerState()).toBe('false');

      await userEvent.click(screen.getByRole('button', { name: 'Open navigation' }));

      expect(drawerState()).toBe('true');
      // One trigger that opens: a second tap keeps the drawer open instead of
      // toggling it, so the drawer's own close button stays the only dismiss.
      await userEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
      expect(drawerState()).toBe('true');

      await userEvent.click(screen.getByRole('button', { name: 'Close drawer' }));
      expect(drawerState()).toBe('false');

      // And it opens again once the drawer has been dismissed.
      await userEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
      expect(drawerState()).toBe('true');
    });

    it('uses a custom navLabel for the trigger', () => {
      setViewportWidth(MOBILE_WIDTH);
      render(
        <AppShell sidebar={<div>nav</div>} navLabel="Show menu">
          <p>Page body</p>
        </AppShell>,
      );

      expect(screen.getByRole('button', { name: 'Show menu' })).toBeInTheDocument();
    });
  });

  describe('desktop (>= compactBreakpoint)', () => {
    it('renders no compact bar but keeps the sidebar and children', () => {
      setViewportWidth(DESKTOP_WIDTH);
      render(
        <AppShell sidebar={<div data-testid="static-sidebar">nav</div>}>
          <p>Page body</p>
        </AppShell>,
      );

      expect(document.querySelector('.ui-app-bar')).toBeNull();
      expect(screen.queryByRole('button', { name: 'Open navigation' })).toBeNull();
      expect(screen.getByTestId('static-sidebar')).toBeInTheDocument();
      expect(screen.getByText('Page body')).toBeInTheDocument();
    });
  });

  it('closes an open drawer when the viewport widens', () => {
    setViewportWidth(MOBILE_WIDTH);
    const state: { current: AppShellDrawerState | null } = { current: null };
    render(
      <AppShell sidebar={makeDrawer(state)}>
        <p>Page body</p>
      </AppShell>,
    );

    act(() => state.current?.onMobileOpen());
    expect(drawerState()).toBe('true');

    act(() => setViewportWidth(DESKTOP_WIDTH));

    expect(drawerState()).toBe('false');
    expect(document.querySelector('.ui-app-bar')).toBeNull();
  });
});
