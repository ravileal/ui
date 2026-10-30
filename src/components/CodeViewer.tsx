import type { CSSProperties, ReactNode } from 'react';
import { Badge } from './Badge';
import type { Tone } from '../internal/tone';

const toneColor: Record<Tone, string> = {
  neutral: 'var(--ui-text-2)',
  info: 'var(--ui-blue)',
  success: 'var(--ui-green)',
  warning: 'var(--ui-amber)',
  danger: 'var(--ui-red)',
  accent: 'var(--ui-accent)',
  purple: 'var(--ui-purple)',
};

export interface CodeViewerLine {
  id?: string;
  number?: number;
  text: string;
  badge?: ReactNode;
  detail?: string;
  tone?: Tone;
  muted?: boolean;
  strikethrough?: boolean;
}

export interface CodeViewerProps {
  lines: CodeViewerLine[];
  ariaLabel: string;
  maxHeight?: number;
  emptyText?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Read-only monospace viewer with per-line tone, badge and title. Used by the
 * invoice parser inspector; generic enough for any line-oriented diagnostic.
 */
export default function CodeViewer({
  lines,
  ariaLabel,
  maxHeight = 320,
  emptyText = 'No lines',
  className,
  style,
}: CodeViewerProps) {
  return (
    <div
      className={className}
      style={{
        border: '1px solid var(--ui-border)',
        borderRadius: 10,
        background: 'var(--ui-surface-2)',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        className="ui-scroll-y"
        role="list"
        aria-label={ariaLabel}
        style={{ maxHeight, overflowY: 'auto', padding: '4px 0' }}
      >
        {lines.length === 0 && (
          <div style={{ padding: 16, color: 'var(--ui-text-3)', fontSize: 12 }}>{emptyText}</div>
        )}
        {lines.map((line, index) => {
          const color = toneColor[line.tone ?? 'neutral'];
          return (
            <div
              key={line.id ?? `${line.number ?? index}-${line.text}`}
              role="listitem"
              title={line.detail}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '4px 10px',
                borderLeft: `2px solid ${line.tone && line.tone !== 'neutral' ? color : 'transparent'}`,
                color: line.muted ? 'var(--ui-text-3)' : color,
                opacity: line.muted ? 0.65 : 1,
                textDecoration: line.strikethrough ? 'line-through' : undefined,
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
                fontSize: 11,
                lineHeight: 1.5,
              }}
            >
              <span
                style={{
                  width: 26,
                  flexShrink: 0,
                  textAlign: 'right',
                  color: 'var(--ui-text-3)',
                  fontSize: 10,
                  userSelect: 'none',
                }}
              >
                {line.number ?? index + 1}
              </span>
              <span
                style={{
                  minWidth: 0,
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'pre',
                }}
              >
                {line.text || ' '}
              </span>
              {line.badge != null && (
                <Badge tone={line.tone ?? 'neutral'} variant="solid">
                  {line.badge}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
