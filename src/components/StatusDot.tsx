import type { CSSProperties } from 'react';
import type { Tone } from '../internal/tone';

/** 6px, 9px (default) and 12px. */
export type StatusDotSize = 'sm' | 'md' | 'lg';

/** The badge palette, aliased so the dot can drift from it on its own. */
export type StatusDotTone = Tone;

export interface StatusDotProps {
  tone?: StatusDotTone;
  size?: StatusDotSize;
  /** Soft ring in the dot's own tone, for dots that lead a row or a card. */
  halo?: boolean;
  /** Expanding ring, for the one state that is still in flight. */
  pulse?: boolean;
  /** Text alternative. A dot without one is decorative and hidden from AT. */
  label?: string;
  title?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * A tone dot on its own: no text, no padding, no border. It carries meaning
 * only next to a label, so the default is `aria-hidden` and a `label` turns it
 * into an accessible image instead.
 */
export default function StatusDot({
  tone = 'neutral',
  size = 'md',
  halo = false,
  pulse = false,
  label,
  title,
  className,
  style,
}: StatusDotProps) {
  const decorative = !label;

  return (
    <span
      className={[
        'ui-status-dot',
        `ui-status-dot--${size}`,
        tone !== 'neutral' ? `ui-status-dot--${tone}` : '',
        halo ? 'ui-status-dot--halo' : '',
        pulse ? 'ui-status-dot--pulse' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      role={decorative ? undefined : 'img'}
      aria-label={label}
      aria-hidden={decorative ? true : undefined}
      title={title}
    />
  );
}
