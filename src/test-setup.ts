import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!('ResizeObserver' in globalThis)) {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    value: ResizeObserverMock,
    writable: true,
  });
}

/**
 * Controllable `window.matchMedia` stub (jsdom does not implement it).
 * Set the simulated viewport width with `setViewportWidth(px)`; every live
 * MediaQueryList listener is notified so `useSyncExternalStore` consumers
 * re-render as they would in a real browser.
 */
const DEFAULT_VIEWPORT_WIDTH = 1024;

let viewportWidth = DEFAULT_VIEWPORT_WIDTH;
const mediaQueryListeners = new Set<(event: MediaQueryListEvent) => void>();

function notifyMediaQueries() {
  const event = { matches: false, media: '' } as MediaQueryListEvent;
  for (const listener of mediaQueryListeners) listener(event);
}

/** Simulate a viewport width change for all `matchMedia` queries. */
export function setViewportWidth(width: number) {
  viewportWidth = width;
  notifyMediaQueries();
}

/** Restore the default (desktop) viewport width. */
export function resetViewportWidth() {
  setViewportWidth(DEFAULT_VIEWPORT_WIDTH);
}

function createMediaQueryList(query: string): MediaQueryList {
  const maxWidthMatch = /max-width:\s*(\d+(?:\.\d+)?)px/.exec(query);
  const maxWidth = maxWidthMatch ? Number(maxWidthMatch[1]) : Number.POSITIVE_INFINITY;

  const list = {
    media: query,
    onchange: null,
    get matches() {
      return viewportWidth <= maxWidth;
    },
    addEventListener(type: string, listener: (event: MediaQueryListEvent) => void) {
      if (type === 'change') mediaQueryListeners.add(listener);
    },
    removeEventListener(type: string, listener: (event: MediaQueryListEvent) => void) {
      if (type === 'change') mediaQueryListeners.delete(listener);
    },
    addListener(listener: (event: MediaQueryListEvent) => void) {
      mediaQueryListeners.add(listener);
    },
    removeListener(listener: (event: MediaQueryListEvent) => void) {
      mediaQueryListeners.delete(listener);
    },
    dispatchEvent() {
      return true;
    },
  };

  return list as unknown as MediaQueryList;
}

if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => createMediaQueryList(query),
  });
}

afterEach(() => {
  cleanup();
  resetViewportWidth();
});
