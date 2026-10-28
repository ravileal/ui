import type { ComponentPropsWithRef } from 'react';

export interface RadioProps extends Omit<ComponentPropsWithRef<'input'>, 'type' | 'size'> {
  size?: 'sm' | 'md';
}

export default function Radio({ size = 'md', className, ...props }: RadioProps) {
  return (
    <input
      type="radio"
      className={`ui-radio${size === 'sm' ? ' is-sm' : ''}${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
}
