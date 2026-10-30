import type { CSSProperties, ReactNode } from 'react';
import type { Tone } from '../internal/tone';

const toneColor: Record<Tone, string> = {
  neutral: 'var(--ui-text)',
  info: 'var(--ui-blue)',
  success: 'var(--ui-green)',
  warning: 'var(--ui-amber)',
  danger: 'var(--ui-red)',
  accent: 'var(--ui-accent)',
  purple: 'var(--ui-purple)',
};

export interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
  /** Hero variant: larger value, top accent bar and a media slot on the right. */
  variant?: 'compact' | 'hero';
  /** Top accent bar color (hero variant). */
  accent?: string;
  /** Avatar/badge revealed on the top right (hero variant). */
  media?: ReactNode;
  /** Overrides the hint color (hero variant). */
  hintColor?: string;
  /** Overrides the value font size. */
  valueSize?: number;
  className?: string;
  style?: CSSProperties;
}

/** Compact metric tile used in dashboards and diagnostic side panels. */
export default function StatCard({
  label,
  value,
  hint,
  tone = 'neutral',
  icon,
  variant = 'compact',
  accent,
  media,
  hintColor,
  valueSize,
  className,
  style,
}: StatCardProps) {
  if (variant === 'hero') {
    return (
      <div
        className={['ui-stat-card', 'ui-stat-card--hero', className ?? '']
          .filter(Boolean)
          .join(' ')}
        style={style}
      >
        {accent && <span className="ui-stat-card-accent" style={{ background: accent }} />}
        <div className="ui-stat-card-top">
          <span className="ui-stat-card-label">{label}</span>
          {media}
        </div>
        <div
          className="ui-stat-card-value"
          style={{ color: toneColor[tone], fontSize: valueSize ?? 26 }}
        >
          {value}
        </div>
        {hint && (
          <div className="ui-stat-card-hint" style={{ color: hintColor }}>
            {hint}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        background: 'var(--ui-surface-2)',
        border: '1px solid var(--ui-border)',
        borderRadius: 10,
        padding: '10px 12px',
        minWidth: 0,
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          color: 'var(--ui-text-3)',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {icon}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      </div>
      <div
        style={{
          color: toneColor[tone],
          fontSize: valueSize ?? 15,
          fontWeight: 700,
          marginTop: 4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={typeof value === 'string' ? value : undefined}
      >
        {value}
      </div>
      {hint && (
        <div
          style={{
            color: hintColor ?? 'var(--ui-text-3)',
            fontSize: 10,
            marginTop: 3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
