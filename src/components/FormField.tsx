import {
  cloneElement,
  isValidElement,
  useId,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

export interface FormFieldControlProps {
  id: string;
  describedBy?: string;
  invalid: boolean;
}

export interface FormFieldProps {
  label?: ReactNode;
  /** ID of the control. When omitted, the first child's `id` or a generated ID is used. */
  htmlFor?: string;
  id?: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode | ((props: FormFieldControlProps) => ReactNode);
  className?: string;
  style?: CSSProperties;
}

function isRenderProp(
  children: FormFieldProps['children'],
): children is (props: FormFieldControlProps) => ReactNode {
  return typeof children === 'function';
}

/**
 * Label + hint + error wrapper. It clones a single form-control child to inject
 * `id`, `aria-describedby` and `aria-invalid`; render-prop usage is available
 * for custom controls.
 */
export default function FormField({
  label,
  htmlFor,
  id,
  hint,
  error,
  required = false,
  children,
  className,
  style,
}: FormFieldProps) {
  const generatedId = useId();
  const child: ReactElement<Record<string, unknown>> | null =
    !isRenderProp(children) && isValidElement(children)
      ? (children as ReactElement<Record<string, unknown>>)
      : null;
  const childId = typeof child?.props.id === 'string' ? child.props.id : undefined;
  const controlId = htmlFor ?? id ?? childId ?? generatedId;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const invalid = Boolean(error);

  let control: ReactNode;
  if (isRenderProp(children)) {
    control = children({ id: controlId, describedBy, invalid });
  } else if (child) {
    const childDescribedBy =
      [child.props['aria-describedby'], describedBy].filter(Boolean).join(' ') || undefined;
    control = cloneElement(child, {
      id: childId ?? controlId,
      'aria-describedby': childDescribedBy,
      'aria-invalid': invalid ? true : child.props['aria-invalid'],
      ...(required ? { required: true } : {}),
    });
  } else {
    control = children;
  }

  return (
    <div className={['ui-form-field', className ?? ''].filter(Boolean).join(' ')} style={style}>
      {label && (
        <label className="ui-form-label" htmlFor={controlId}>
          {label}
          {required && (
            <span className="ui-form-required" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
      )}
      {hint && (
        <div id={hintId} className="ui-form-hint">
          {hint}
        </div>
      )}
      {control}
      {error && (
        <div id={errorId} className="ui-form-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
