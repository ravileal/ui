import {
  useCallback,
  useEffect,
  useId,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { usePopover } from '../internal/usePopover';
import Tooltip from './Tooltip';

export interface DropdownOption {
  value: string;
  label: string;
  /** Optional swatch color rendered as a dot in the option (and in the trigger when `dot`). */
  color?: string;
  /** Optional leading icon rendered in the option (and in the trigger when selected). */
  icon?: ReactNode;
  /** Optional tooltip shown while hovering the option (e.g. the raw card number). */
  hint?: string;
  /** Label of the hint tooltip. */
  hintLabel?: string;
  /**
   * Nested options revealed when this one is selected. The parent is not
   * committed: the user must pick one of the children (used when an alias
   * groups several card patterns).
   */
  children?: DropdownOption[];
}

export interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  ariaLabel: string;
  /** Shown by the trigger when `value` matches no option. */
  placeholder?: string;
  title?: string;
  /** Trigger text color (falls back to `var(--ui-text-2)`). */
  color?: string;
  /** Render a color dot before the value when a `color` is given. */
  dot?: boolean;
  fontSize?: number;
  fontWeight?: number;
  /** `sm` for compact table cells, `md` for form fields (matches input height). */
  size?: 'sm' | 'md';
  /** When false the trigger shrinks to its content (e.g. filter bars). */
  fullWidth?: boolean;
  disabled?: boolean;
  maxHeight?: number;
  /** Notifies the owner when the list opens/closes (used to suppress trigger tooltips). */
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * Accessible custom select. The option list is rendered in a portal so it is
 * never clipped by ancestor `overflow: hidden` (transaction rows live inside
 * grouped containers that clip), and is styled with the app theme + custom
 * scrollbar instead of the native OS dropdown.
 */
export default function Dropdown({
  value,
  onChange,
  options,
  ariaLabel,
  placeholder = '—',
  title,
  color,
  dot = false,
  fontSize = 13,
  fontWeight,
  size = 'sm',
  fullWidth = true,
  disabled = false,
  maxHeight = 260,
  onOpenChange,
  className,
  style,
}: DropdownProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState<DropdownOption | null>(null);
  const listboxId = useId();

  const goBack = useCallback(() => {
    if (!expanded) return;
    const parentIndex = options.findIndex(
      (option) => option.value === expanded.value && option.label === expanded.label,
    );
    setExpanded(null);
    setActiveIndex(parentIndex >= 0 ? parentIndex : 0);
  }, [expanded, options]);

  const handleEscape = useCallback(() => {
    if (!expanded) return false;
    goBack();
    return true;
  }, [expanded, goBack]);

  const { open, pos, triggerRef, menuRef, openMenu, closeMenu } = usePopover({
    maxHeight,
    onEscape: handleEscape,
  });

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;
  const currentOptions = expanded?.children ?? options;

  const showMenu = useCallback(() => {
    if (disabled || options.length === 0) return;
    setExpanded(null);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    openMenu();
  }, [disabled, openMenu, options.length, selectedIndex]);

  // The nested list is an intermediate step, not a value: it disappears when
  // the menu closes so reopening always starts at the root list.
  useEffect(() => {
    if (!open) setExpanded(null);
  }, [open]);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  const commit = useCallback(
    (index: number) => {
      const option = currentOptions[index];
      if (!option) return;
      if (option.children?.length) {
        const currentChildIndex = option.children.findIndex((child) => child.value === value);
        setExpanded(option);
        setActiveIndex(currentChildIndex >= 0 ? currentChildIndex : 0);
        return;
      }
      onChange(option.value);
      closeMenu(true);
    },
    [closeMenu, currentOptions, onChange, value],
  );

  const onTriggerKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showMenu();
      }
      return;
    }
    if (e.key === 'ArrowLeft' && expanded) {
      e.preventDefault();
      goBack();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, currentOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(currentOptions.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      commit(activeIndex);
    }
  };

  return (
    <div
      className={
        'ui-dropdown' + (fullWidth ? '' : ' is-inline') + (className ? ' ' + className : '')
      }
      style={style}
    >
      <button
        ref={triggerRef}
        type="button"
        className={'ui-dropdown-trigger' + (size === 'md' ? ' is-md' : '')}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        title={title}
        disabled={disabled}
        onClick={() => (open ? closeMenu() : showMenu())}
        onKeyDown={onTriggerKeyDown}
      >
        {selected?.icon && <span className="ui-dropdown-icon">{selected.icon}</span>}
        {dot && color && <span className="ui-dropdown-dot" style={{ background: color }} />}
        <span className="ui-dropdown-value" style={{ fontSize, fontWeight, color }}>
          {selected?.label ?? (value || placeholder)}
        </span>
        <span className="ui-dropdown-caret" aria-hidden="true">
          ▾
        </span>
      </button>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            className="ui-dropdown-menu"
            style={{
              left: pos.left,
              top: pos.top,
              bottom: pos.bottom,
              width: pos.width,
              maxHeight: pos.maxHeight,
            }}
          >
            {expanded && (
              <button
                type="button"
                aria-label={`Back to ${ariaLabel}`}
                onClick={goBack}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  width: '100%',
                  padding: '6px 10px',
                  marginBottom: 4,
                  border: 'none',
                  borderRadius: 7,
                  background: 'var(--ui-surface-2)',
                  color: 'var(--ui-text-2)',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span aria-hidden="true">‹</span>
                <span
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {expanded.label}
                </span>
              </button>
            )}
            <div id={listboxId} role="listbox" aria-label={ariaLabel}>
              {currentOptions.map((option, index) => {
                const key = `${option.value}-${index}`;
                const optionNode = (
                  <div
                    key={key}
                    role="option"
                    aria-selected={option.value === value}
                    className={
                      'ui-dropdown-option' +
                      (index === activeIndex ? ' is-active' : '') +
                      (option.value === value ? ' is-selected' : '')
                    }
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => commit(index)}
                  >
                    {option.icon && <span className="ui-dropdown-icon">{option.icon}</span>}
                    {option.color && (
                      <span className="ui-dropdown-dot" style={{ background: option.color }} />
                    )}
                    <span className="ui-dropdown-option-label">{option.label}</span>
                    {option.children?.length ? (
                      <span className="ui-dropdown-caret" aria-hidden="true">
                        ›
                      </span>
                    ) : (
                      option.value === value && (
                        <span className="ui-dropdown-check" aria-hidden="true">
                          ✓
                        </span>
                      )
                    )}
                  </div>
                );

                if (!option.hint) return optionNode;

                return (
                  <Tooltip
                    key={key}
                    as="div"
                    delay={0}
                    content={
                      <>
                        {option.hintLabel && (
                          <span className="ui-tooltip-label">{option.hintLabel}</span>
                        )}
                        {option.hint}
                      </>
                    }
                  >
                    {optionNode}
                  </Tooltip>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
