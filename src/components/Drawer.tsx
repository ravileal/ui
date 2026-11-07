import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../internal/useFocusTrap';

export type DrawerPlacement = 'left' | 'right' | 'bottom';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  /** Header content; any node so a title can carry inline markup. */
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Edge the panel is anchored to. Defaults to `"right"`. */
  placement?: DrawerPlacement;
  /** Rendered in the header next to the title (e.g. a type badge). */
  badge?: ReactNode;
  /** Grab bar above the header. On by default for `"bottom"`, ignored otherwise. */
  handle?: boolean;
  /** Max height of a bottom sheet; ignored for side placements. Defaults to `"62vh"`. */
  height?: number | string;
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
  placement = 'right',
  badge,
  handle,
  height = '62vh',
  width = 420,
  closeLabel = 'Close',
  className,
  style,
  bodyClassName,
}: DrawerProps) {
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const isBottom = placement === 'bottom';
  const showHandle = isBottom && handle !== false;

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

  // A bottom sheet is sized by its content up to `height`; the side drawers keep
  // their fixed `width`. Width/max-width for the sheet come from the stylesheet
  // so the <= 640px block can take over the full viewport.
  const panelStyle: CSSProperties = isBottom
    ? { maxHeight: height, ...style }
    : { width, maxWidth: '100vw', ...style };

  return createPortal(
    <div className="ui-drawer-overlay" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={['ui-drawer', `ui-drawer--${placement}`, className ?? '']
          .filter(Boolean)
          .join(' ')}
        style={panelStyle}
        onClick={(event) => event.stopPropagation()}
      >
        {showHandle && <div className="ui-drawer-handle" aria-hidden="true" />}
        <div className="ui-drawer-header">
          <div className="ui-drawer-heading">
            <div id={titleId} className="ui-drawer-title">
              {title}
            </div>
            {badge && <div className="ui-drawer-badge">{badge}</div>}
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
