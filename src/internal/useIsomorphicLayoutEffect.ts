import { useEffect, useLayoutEffect } from 'react';

/**
 * `useLayoutEffect` warns when rendered on the server. The library supports
 * ReactDOMServer, so components use `useEffect` in that environment instead.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
