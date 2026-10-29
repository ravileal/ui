import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';

export interface DropdownMenuItem {
  type?: 'item';
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onSelect?: () => void;
}

export interface DropdownMenuSeparator {
  type: 'separator';
  id?: string;
}

export type DropdownMenuEntry = DropdownMenuItem | DropdownMenuSeparator;

export interface DropdownMenuProps {
  /** Trigger content (rendered inside the menu button). */
  trigger: ReactNode;
  items: DropdownMenuEntry[];
  ariaLabel: string;
  align?: 'start' | 'end';
  className?: string;
  style?: CSSProperties;
  /** Extra classes for the trigger button (used by SplitButton). */
  triggerClassName?: string;
  triggerStyle?: CSSProperties;
  disabled?: boolean;
}

function isItem(entry: DropdownMenuEntry): entry is DropdownMenuItem {
  return entry.type !== 'separator';
}

export function DropdownMenu({
  trigger,
  items,
  ariaLabel,
  align = 'start',
  className,
  style,
  triggerClassName,
  triggerStyle,
  disabled = false,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const first = menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not(:disabled)');
    first?.focus();

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      close(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  const onTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (open) return;
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen(true);
    }
  };

  const onMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const focusable = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ??
        [],
    );
    if (!focusable.length) return;
    const currentIndex = focusable.indexOf(document.activeElement as HTMLButtonElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusable[(currentIndex + 1) % focusable.length]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusable[(currentIndex - 1 + focusable.length) % focusable.length]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusable[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      focusable[focusable.length - 1]?.focus();
    } else if (event.key === 'Tab') {
      close(false);
    }
  };

  return (
    <div className={['ui-menu', className ?? ''].filter(Boolean).join(' ')} style={style}>
      <button
        ref={triggerRef}
        type="button"
        className={['ui-menu-trigger', triggerClassName].filter(Boolean).join(' ')}
        style={triggerStyle}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          open ? close() : setOpen(true);
        }}
        onKeyDown={onTriggerKeyDown}
      >
        {trigger}
        <span className="ui-menu-caret" aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={ariaLabel}
          className={`ui-menu-list${align === 'end' ? ' is-end' : ''}`}
          onKeyDown={onMenuKeyDown}
        >
          {items.map((entry, index) => {
            if (!isItem(entry)) {
              return (
                <div
                  key={entry.id ?? `separator-${index}`}
                  role="separator"
                  className="ui-menu-separator"
                />
              );
            }
            return (
              <button
                key={entry.id}
                type="button"
                role="menuitem"
                disabled={entry.disabled}
                className={['ui-menu-item', entry.danger ? 'is-danger' : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => {
                  if (entry.disabled) return;
                  entry.onSelect?.();
                  close();
                }}
              >
                {entry.icon && (
                  <span className="ui-menu-item-icon" aria-hidden="true">
                    {entry.icon}
                  </span>
                )}
                <span>{entry.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { DropdownMenu as Menu };
