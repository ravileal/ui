import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  ariaLabel: string;
  placeholder?: string;
  noResultsLabel?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Searchable single-select. The input filters the listbox; the selected value
 * is shown when the popover is closed.
 */
export default function Combobox({
  value,
  onChange,
  options,
  ariaLabel,
  placeholder = 'Select…',
  noResultsLabel = 'No results',
  disabled = false,
  className,
  style,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const selected = options.find((option) => option.value === value);
  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? options.filter((option) => option.label.toLowerCase().includes(normalized))
    : options;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const openList = () => {
    if (disabled) return;
    setOpen(true);
    setQuery('');
    setActiveIndex(0);
  };

  const select = (option: ComboboxOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setOpen(false);
    setQuery('');
    inputRef.current?.focus();
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) openList();
      else setActiveIndex((index) => Math.min(filtered.length - 1, index + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(0, index - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option) select(option);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div
      ref={rootRef}
      className={['ui-combobox', className ?? ''].filter(Boolean).join(' ')}
      style={style}
    >
      <input
        ref={inputRef}
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && filtered[activeIndex] ? `${listId}-${activeIndex}` : undefined
        }
        className="ui-input ui-combobox-input"
        value={open ? query : (selected?.label ?? '')}
        placeholder={selected?.label ?? placeholder}
        disabled={disabled}
        onFocus={openList}
        onClick={openList}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActiveIndex(0);
        }}
        onKeyDown={onKeyDown}
      />
      {open && (
        <div id={listId} role="listbox" aria-label={ariaLabel} className="ui-combobox-menu">
          {filtered.length === 0 ? (
            <div className="ui-combobox-empty">{noResultsLabel}</div>
          ) : (
            filtered.map((option, index) => (
              <div
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={option.value === value}
                aria-disabled={option.disabled || undefined}
                className={[
                  'ui-combobox-option',
                  index === activeIndex ? 'is-active' : '',
                  option.value === value ? 'is-selected' : '',
                  option.disabled ? 'is-disabled' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => select(option)}
              >
                <span className="ui-combobox-label">{option.label}</span>
                {option.description && (
                  <span className="ui-combobox-description">{option.description}</span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
