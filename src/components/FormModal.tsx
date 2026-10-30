import type { CSSProperties, ReactNode, RefObject } from 'react';
import Alert from './Alert';
import Button from './Button';
import Modal from './Modal';

export interface ModalFooterProps {
  onCancel?: () => void;
  onConfirm?: () => void;
  cancelLabel?: string;
  confirmLabel?: string;
  busy?: boolean;
  busyLabel?: string;
  confirmDisabled?: boolean;
  danger?: boolean;
  /** Extra controls rendered on the left side of the footer. */
  extra?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Right-aligned Cancel/Confirm footer shared by form modals. */
export function ModalFooter({
  onCancel,
  onConfirm,
  cancelLabel = 'Cancel',
  confirmLabel = 'Save',
  busy = false,
  busyLabel = 'Saving…',
  confirmDisabled = false,
  danger = false,
  extra,
  className,
  style,
}: ModalFooterProps) {
  return (
    <div className={['ui-modal-footer', className ?? ''].filter(Boolean).join(' ')} style={style}>
      {extra && <div className="ui-modal-footer-extra">{extra}</div>}
      <div className="ui-modal-footer-actions">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
        )}
        {onConfirm && (
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={busy}
            disabled={confirmDisabled}
          >
            {busy ? busyLabel : confirmLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export interface FormModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit?: () => void;
  children: ReactNode;
  error?: ReactNode;
  busy?: boolean;
  submitLabel?: string;
  busyLabel?: string;
  cancelLabel?: string;
  submitDisabled?: boolean;
  danger?: boolean;
  footerExtra?: ReactNode;
  maxWidth?: number;
  panelStyle?: CSSProperties;
  panelClassName?: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

/**
 * Form-oriented modal shell: `Modal` plus a consistent body spacing, an error
 * alert and a Cancel/Save footer. The caller still owns validation and submit.
 */
export default function FormModal({
  open,
  title,
  onClose,
  onSubmit,
  children,
  error,
  busy = false,
  submitLabel = 'Save',
  busyLabel = 'Saving…',
  cancelLabel = 'Cancel',
  submitDisabled = false,
  danger = false,
  footerExtra,
  maxWidth,
  panelStyle,
  panelClassName,
  initialFocusRef,
  closeOnBackdrop,
  closeOnEscape,
}: FormModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      maxWidth={maxWidth}
      panelStyle={panelStyle}
      panelClassName={panelClassName}
      initialFocusRef={initialFocusRef}
      closeOnBackdrop={closeOnBackdrop}
      closeOnEscape={closeOnEscape}
    >
      <div className="ui-form-modal-body">{children}</div>
      {error && (
        <Alert tone="danger" style={{ marginTop: 12 }}>
          {error}
        </Alert>
      )}
      <ModalFooter
        onCancel={onClose}
        onConfirm={onSubmit}
        cancelLabel={cancelLabel}
        confirmLabel={submitLabel}
        busy={busy}
        busyLabel={busyLabel}
        confirmDisabled={submitDisabled}
        danger={danger}
        extra={footerExtra}
      />
    </Modal>
  );
}
