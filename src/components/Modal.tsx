import { useId, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { useFocusTrap } from '../internal/useFocusTrap';

export interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: number;
  /** Overrides the panel defaults (e.g. a taller, non-scrolling viewer). */
  panelStyle?: CSSProperties;
  panelClassName?: string;
  closeLabel?: string;
  /** Element focused when the modal opens; defaults to the first focusable child. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

const overlay: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'var(--ui-overlay)',
  zIndex: 1500,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 16,
};

/**
 * Generic modal shell (overlay + centered panel). Traps focus, closes on
 * Escape/backdrop by default, restores focus on close and keeps content in the
 * caller.
 */
export default function Modal({
  open,
  title,
  onClose,
  children,
  maxWidth = 440,
  panelStyle,
  panelClassName,
  closeLabel = 'Close',
  initialFocusRef,
  closeOnBackdrop = true,
  closeOnEscape = true,
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useFocusTrap({
    active: open,
    containerRef: panelRef,
    initialFocusRef,
    onEscape: closeOnEscape ? onClose : () => {},
  });

  if (!open) return null;

  return (
    <div style={overlay} onClick={closeOnBackdrop ? onClose : undefined}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--ui-surface)',
          border: '1px solid var(--ui-border)',
          borderRadius: 14,
          padding: 24,
          maxWidth,
          width: '92%',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: 'var(--ui-shadow-lg)',
          outline: 'none',
          ...panelStyle,
        }}
        className={`ui-scroll-y${panelClassName ? ` ${panelClassName}` : ''}`}
      >
        <div style={headerStyle}>
          <div id={titleId} style={{ fontSize: 16, fontWeight: 700, color: 'var(--ui-text)' }}>
            {title}
          </div>
          <button
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--ui-border)',
              background: 'var(--ui-surface-2)',
              color: 'var(--ui-text-2)',
              borderRadius: 7,
              fontSize: 13,
              lineHeight: 1,
              padding: '5px 8px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
