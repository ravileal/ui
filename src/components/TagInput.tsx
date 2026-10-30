import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import { Chip } from './Badge';
import Button from './Button';
import TextInput from './TextInput';

export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  placeholder?: string;
  /** Label of the add button. Defaults to "Add". */
  addLabel?: string;
  /** Accessible label of the text field. */
  inputAriaLabel?: string;
  /** Accessible label of each remove button. */
  removeLabel?: string | ((tag: string) => string);
  /** Shown when there are no tags yet. */
  emptyLabel?: ReactNode;
  /** Maximum number of tags; the add button is disabled once reached. */
  maxTags?: number;
  disabled?: boolean;
  id?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Controlled tag/chip editor: a list of removable chips plus a text field that
 * adds a tag on Enter or on the add button. Duplicates and whitespace-only
 * values are ignored.
 */
export default function TagInput({
  value,
  onChange,
  label,
  hint,
  error,
  placeholder = 'Add a tag',
  addLabel = 'Add',
  inputAriaLabel,
  removeLabel = (tag) => `Remove ${tag}`,
  emptyLabel = 'No tags yet.',
  maxTags,
  disabled = false,
  id,
  className,
  style,
}: TagInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const [draft, setDraft] = useState('');
  const atLimit = maxTags != null && value.length >= maxTags;

  const addTag = () => {
    const next = draft.trim();
    if (!next || disabled || atLimit) return;
    if (!value.includes(next)) onChange([...value, next]);
    setDraft('');
  };

  return (
    <div className={['ui-tag-input', className ?? ''].filter(Boolean).join(' ')} style={style}>
      {label && (
        <label className="ui-form-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      {hint && (
        <div id={hintId} className="ui-form-hint">
          {hint}
        </div>
      )}
      <div className="ui-tag-list">
        {value.length === 0 ? (
          <span className="ui-tag-empty">{emptyLabel}</span>
        ) : (
          value.map((tag) => (
            <Chip
              key={tag}
              tone="neutral"
              variant="outline"
              onRemove={disabled ? undefined : () => onChange(value.filter((item) => item !== tag))}
              removeLabel={typeof removeLabel === 'function' ? removeLabel(tag) : removeLabel}
            >
              {tag}
            </Chip>
          ))
        )}
      </div>
      <div className="ui-tag-add">
        <TextInput
          id={inputId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          aria-label={inputAriaLabel ?? 'Add tag'}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          disabled={disabled || atLimit}
        />
        <Button
          variant="secondary"
          onClick={addTag}
          disabled={disabled || atLimit || draft.trim() === ''}
        >
          {addLabel}
        </Button>
      </div>
      {error && (
        <div id={errorId} className="ui-form-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
