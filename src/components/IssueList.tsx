import type { CSSProperties, ReactNode } from 'react';
import { Badge } from './Badge';
import type { Tone } from '../internal/tone';

export interface IssueListItem {
  path: string;
  message: string;
  tone?: Tone;
  actionLabel?: string;
  onSelect?: () => void;
}

export interface IssueListProps {
  issues: IssueListItem[];
  title?: ReactNode;
  emptyText?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Clickable validation issues with path, message and optional navigation. */
export default function IssueList({
  issues,
  title,
  emptyText = 'No issues',
  className,
  style,
}: IssueListProps) {
  return (
    <div className={className} style={style}>
      {title && (
        <div
          style={{
            color: 'var(--ui-text-2)',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            marginBottom: 6,
          }}
        >
          {title}
        </div>
      )}
      {issues.length === 0 ? (
        <div style={{ color: 'var(--ui-text-3)', fontSize: 12 }}>{emptyText}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {issues.map((issue, index) => {
            const content = (
              <>
                <Badge tone={issue.tone ?? 'danger'} variant="soft">
                  {issue.path}
                </Badge>
                <span style={{ minWidth: 0, flex: 1, color: 'var(--ui-text-2)' }}>
                  {issue.message}
                </span>
                {issue.onSelect && (
                  <span style={{ color: 'var(--ui-accent)', fontSize: 11, whiteSpace: 'nowrap' }}>
                    {issue.actionLabel ?? 'Corrigir'} →
                  </span>
                )}
              </>
            );

            const rowStyle: CSSProperties = {
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '6px 8px',
              borderRadius: 8,
              border: '1px solid var(--ui-border)',
              background: 'var(--ui-surface-2)',
              color: 'var(--ui-text)',
              fontSize: 12,
              textAlign: 'left',
              cursor: issue.onSelect ? 'pointer' : 'default',
            };

            return issue.onSelect ? (
              <button
                key={`${issue.path}-${index}`}
                type="button"
                onClick={issue.onSelect}
                style={rowStyle}
              >
                {content}
              </button>
            ) : (
              <div key={`${issue.path}-${index}`} style={rowStyle}>
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
