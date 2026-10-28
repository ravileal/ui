import type { CSSProperties, ReactNode } from 'react';

export interface InlineEditorCardProps {
  title: string;
  onSave: () => void;
  onCancel: () => void;
  saveDisabled?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  embedded?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Inline editor shell: card with a title, customizable fields and
 * Cancel/Save. `embedded` renders it flush inside a list, right below the
 * edited item (the pattern used by Aliases/Payment Aliases/Categories).
 */
export function InlineEditorCard({
  title,
  onSave,
  onCancel,
  saveDisabled,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  embedded = false,
  className,
  style,
  children,
}: InlineEditorCardProps) {
  return (
    <div
      className={className}
      style={{
        ...(embedded
          ? {
              background: 'var(--ui-surface-2)',
              borderTop: '1px solid var(--ui-border)',
              padding: '16px 20px',
            }
          : {
              background: 'var(--ui-surface)',
              border: '1px solid var(--ui-border)',
              borderRadius: 12,
              padding: 20,
            }),
        ...style,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ui-text)', marginBottom: 14 }}>
        {title}
      </div>
      {children}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid var(--ui-border)',
            background: 'none',
            color: 'var(--ui-text-2)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saveDisabled}
          style={{
            padding: '8px 20px',
            borderRadius: 8,
            background: 'var(--ui-accent)',
            color: 'var(--ui-on-accent)',
            fontWeight: 600,
            fontSize: 13,
            cursor: saveDisabled ? 'not-allowed' : 'pointer',
            border: 'none',
            opacity: saveDisabled ? 0.6 : 1,
          }}
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
}
