import type { CSSProperties } from 'react';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  circle?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Loading placeholder. It is purely decorative: the container that owns the
 * loading state must expose `role="status"` and an accessible label.
 */
export default function Skeleton({
  width = '100%',
  height = 12,
  radius = 6,
  circle = false,
  className,
  style,
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={className ? `ui-skeleton ${className}` : 'ui-skeleton'}
      style={{
        display: 'inline-block',
        width,
        height,
        borderRadius: circle ? '50%' : radius,
        ...style,
      }}
    />
  );
}
