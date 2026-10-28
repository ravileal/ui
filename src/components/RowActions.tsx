import { useState, type CSSProperties } from 'react';

const buttonBase: CSSProperties = {
  padding: '5px 10px',
  borderRadius: 6,
  fontSize: 11,
  cursor: 'pointer',
};

export interface RowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  confirmDelete?: boolean;
  editLabel?: string;
  deleteLabel?: string;
  cancelLabel?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Inline row actions (Edit / Delete). Delete asks for an inline confirmation by
 * default; flows that need their own dialog (e.g. moving category references)
 * can disable the confirmation and handle it in `onDelete`.
 */
export function RowActions({
  onEdit,
  onDelete,
  confirmDelete = true,
  editLabel = 'Edit',
  deleteLabel = 'Delete',
  cancelLabel = 'Cancel',
  className,
  style,
}: RowActionsProps) {
  const [confirming, setConfirming] = useState(false);
  const rootStyle = { display: 'flex', gap: 6, ...style };

  if (confirming) {
    return (
      <div className={className} style={rootStyle}>
        <button
          type="button"
          onClick={() => {
            onDelete();
            setConfirming(false);
          }}
          style={{
            ...buttonBase,
            background: 'var(--ui-red)',
            color: 'var(--ui-on-accent)',
            fontWeight: 600,
            border: 'none',
          }}
        >
          {deleteLabel}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          style={{
            ...buttonBase,
            background: 'var(--ui-surface-2)',
            color: 'var(--ui-text-2)',
            border: '1px solid var(--ui-border)',
          }}
        >
          {cancelLabel}
        </button>
      </div>
    );
  }

  return (
    <div className={className} style={rootStyle}>
      <button
        type="button"
        onClick={onEdit}
        style={{
          ...buttonBase,
          background: 'none',
          border: '1px solid var(--ui-border)',
          color: 'var(--ui-text-2)',
        }}
      >
        {editLabel}
      </button>
      <button
        type="button"
        onClick={() => (confirmDelete ? setConfirming(true) : onDelete())}
        style={{
          ...buttonBase,
          background: 'none',
          border: '1px solid var(--ui-border)',
          color: 'var(--ui-red)',
        }}
      >
        {deleteLabel}
      </button>
    </div>
  );
}
