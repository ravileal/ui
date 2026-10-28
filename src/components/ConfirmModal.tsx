import Modal from './Modal';
import type { CSSProperties } from 'react';

export interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  panelStyle?: CSSProperties;
  panelClassName?: string;
}

export default function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  danger = false,
  confirmLabel,
  cancelLabel = 'Cancel',
  panelStyle,
  panelClassName,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      maxWidth={380}
      panelStyle={panelStyle}
      panelClassName={panelClassName}
    >
      <div
        style={{
          fontSize: 13,
          color: 'var(--ui-text-2)',
          lineHeight: 1.6,
          marginBottom: 22,
        }}
      >
        {message}
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '9px 18px',
            borderRadius: 8,
            border: '1px solid var(--ui-border)',
            background: 'none',
            color: 'var(--ui-text-2)',
            fontSize: 13,
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          style={{
            padding: '9px 22px',
            borderRadius: 8,
            border: 'none',
            background: danger ? 'var(--ui-red)' : 'var(--ui-accent)',
            color: 'var(--ui-on-accent)',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {confirmLabel ?? (danger ? 'Delete' : 'Confirm')}
        </button>
      </div>
    </Modal>
  );
}
