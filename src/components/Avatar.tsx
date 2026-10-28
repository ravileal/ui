import type { CSSProperties } from 'react';

export interface AvatarProps {
  name: string;
  color: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** Accessible name. Defaults to `name`; pass an empty string to hide it. */
  ariaLabel?: string;
}

export default function Avatar({
  name,
  color,
  size = 32,
  className,
  style,
  ariaLabel,
}: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const label = ariaLabel ?? name;

  return (
    <div
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: 700,
        color: 'var(--ui-on-accent)',
        flexShrink: 0,
        ...style,
      }}
    >
      {initial}
    </div>
  );
}
