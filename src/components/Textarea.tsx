import { forwardRef, type TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid = false, className, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={['ui-textarea', className ?? ''].filter(Boolean).join(' ')}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
});

export default Textarea;
