import { useEffect, useRef, type ComponentPropsWithRef } from 'react';

export interface CheckboxProps extends Omit<ComponentPropsWithRef<'input'>, 'type' | 'size'> {
  size?: 'sm' | 'md';
  /** Visually marks a partial selection (DOM `indeterminate` is not an attribute). */
  indeterminate?: boolean;
}

export default function Checkbox({
  size = 'md',
  className,
  indeterminate = false,
  ...props
}: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      className={`ui-checkbox${size === 'sm' ? ' is-sm' : ''}${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
}
