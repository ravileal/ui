import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../internal/useFocusTrap';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: 'left' | 'right';
  width?: number | string;
  closeLabel?: string;
  className?: string;
  style?: CSSProperties;
  bodyClassName?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  side = 'right',
  width = 420,
  closeLabel = 'Close',
  className,
  style,
  bodyClassName,
}: DrawerProps) {
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useFocusTrap({
    active: open && mounted,
    containerRef: panelRef,
    onEscape: onClose,
  });

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="ui-drawer-overlay" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={['ui-drawer', `ui-drawer--${side}`, className ?? ''].filter(Boolean).join(' ')}
        style={{ width, maxWidth: '100vw', ...style }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-drawer-header">
          <div id={titleId} className="ui-drawer-title">
            {title}
          </div>
          <button
            type="button"
            className="ui-drawer-close"
            aria-label={closeLabel}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className={['ui-drawer-body', bodyClassName ?? ''].filter(Boolean).join(' ')}>
          {children}
        </div>
        {footer && <div className="ui-drawer-footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export { Drawer as Sheet };
