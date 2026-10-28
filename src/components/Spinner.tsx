import type { CSSProperties } from 'react';

export interface SpinnerProps {
  size?: number;
  label?: string;
  className?: string;
  style?: CSSProperties;
}

export default function Spinner({ size = 16, label = 'Loading', className, style }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={className}
      style={{ display: 'inline-flex', flexShrink: 0, ...style }}
    >
      <span
        className="ui-spinner"
        aria-hidden="true"
        style={{ width: size, height: size, borderWidth: Math.max(1.5, size / 8) }}
      />
    </span>
  );
}
