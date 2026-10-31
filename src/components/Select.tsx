import {
  useCallback,
  useId,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { usePopover } from '../internal/usePopover';

export interface SelectOption {
  value: string | number;
  label: ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps {
  value: string | number | null;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  /** Accessible name for the trigger and the popup list. Required: the trigger has no visible label. */
  ariaLabel: string;
  /** Shown when `value` matches no option (including `null`). */
  placeholder?: string;
  /** `md` matches the height of `.ui-input`, `sm` is the compact in-table size. */
  size?: 'sm' | 'md';
  /** When false the trigger shrinks to its content (e.g. table pagination). */
  fullWidth?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  /** Renders a hidden input carrying this name and the current value. */
  name?: string;
  id?: string;
  /** Cap for the portaled list height, in pixels. */
  menuMaxHeight?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Accessible single-select drawn with the app theme instead of the OS. The
 * option list is rendered in a portal through `usePopover`, so an ancestor
 * `overflow: hidden` never clips it and it flips above the trigger when the
 * viewport runs out of room below.
 */
export default function Select({
  value,
  onChange,
  options,
  ariaLabel,
  placeholder = 'Select…',
  size = 'md',
  fullWidth = true,
  disabled = false,
  invalid = false,
  name,
  id,
  menuMaxHeight = 260,
  className,
  style,
}: SelectProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listboxId = useId();
  const { open, pos, triggerRef, menuRef, openMenu, closeMenu } = usePopover({
    maxHeight: menuMaxHeight,
  });

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const showMenu = useCallback(() => {
    if (disabled || options.length === 0) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    openMenu();
  }, [disabled, openMenu, options.length, selectedIndex]);

  const commit = useCallback(
    (index: number) => {
      const option = options[index];
      if (!option || option.disabled) return;
      onChange(option.value);
      closeMenu(true);
    },
    [closeMenu, onChange, options],
  );

  const onTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (!open) {
      // Enter and Space reach the trigger as a native button click, which opens
      // the list through `onClick`; only the arrow keys need explicit handling.
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        showMenu();
      }
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, options.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      commit(activeIndex);
    } else if (event.key === 'Tab') {
      // Move on without committing; Escape is handled by `usePopover`, which
      // also hands focus back to the trigger.
      closeMenu();
    }
  };

  return (
    <div
      className={'ui-select' + (fullWidth ? '' : ' is-inline') + (className ? ' ' + className : '')}
      style={style}
    >
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={
          'ui-select-trigger' + (size === 'md' ? ' is-md' : '') + (invalid ? ' is-invalid' : '')
        }
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => (open ? closeMenu() : showMenu())}
        onKeyDown={onTriggerKeyDown}
      >
        <span className={'ui-select-value' + (selected ? '' : ' is-placeholder')}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="ui-select-caret" aria-hidden="true">
          ▾
        </span>
      </button>
      {name && <input type="hidden" name={name} value={value ?? ''} />}
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            className="ui-dropdown-menu ui-select-menu"
            style={{
              left: pos.left,
              top: pos.top,
              bottom: pos.bottom,
              width: pos.width,
              maxHeight: pos.maxHeight,
            }}
          >
            <div id={listboxId} role="listbox" aria-label={ariaLabel}>
              {options.map((option, index) => {
                const isSelected = option.value === value;
                return (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled || undefined}
                    className={
                      'ui-dropdown-option ui-select-option' +
                      (index === activeIndex ? ' is-active' : '') +
                      (isSelected ? ' is-selected' : '') +
                      (option.disabled ? ' is-disabled' : '')
                    }
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => commit(index)}
                  >
                    <span className="ui-dropdown-option-label">
                      {option.label}
                      {option.description && (
                        <span className="ui-select-option-description">{option.description}</span>
                      )}
                    </span>
                    {isSelected && (
                      <span className="ui-dropdown-check" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
