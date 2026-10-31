import { useCallback, useSyncExternalStore } from 'react';

/** Viewport width (px) below which components switch to their compact layout. */
export const DEFAULT_COMPACT_BREAKPOINT = 640;

function getMatchMedia(breakpoint: number): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  return window.matchMedia(`(max-width: ${breakpoint}px)`);
}

/**
 * Tracks whether the viewport is narrower than `breakpoint` using
 * `useSyncExternalStore`, so SSR and hydration use a stable `false` snapshot.
 *
 * Shared by every compact-aware component (sidebar drawer, application shell)
 * so they agree on the breakpoint and subscribe the same way.
 */
export function useIsCompact(breakpoint: number): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const query = getMatchMedia(breakpoint);
      if (!query) return () => {};
      query.addEventListener('change', onStoreChange);
      return () => query.removeEventListener('change', onStoreChange);
    },
    [breakpoint],
  );

  const getSnapshot = useCallback(() => getMatchMedia(breakpoint)?.matches ?? false, [breakpoint]);
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
