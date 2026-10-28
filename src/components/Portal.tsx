import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  children: ReactNode;
  /** Defaults to `document.body`. Ignored until the component is mounted. */
  container?: Element | null;
}

/**
 * SSR-safe portal: renders `null` on the server and before the first client
 * effect, then mounts the children into the requested container.
 */
export default function Portal({ children, container }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(children, container ?? document.body);
}
