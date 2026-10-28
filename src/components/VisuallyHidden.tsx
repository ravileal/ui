import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  style?: CSSProperties;
}

export default function VisuallyHidden({
  children,
  className,
  style,
  ...props
}: VisuallyHiddenProps) {
  return (
    <span
      className={['ui-visually-hidden', className ?? ''].filter(Boolean).join(' ')}
      style={style}
      {...props}
    >
      {children}
    </span>
  );
}
