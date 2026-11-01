import { useCallback, useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react';
import { DEFAULT_COMPACT_BREAKPOINT, useIsCompact } from '../internal/useIsCompact';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: ReactNode;
  /** Native tooltip; defaults to the label. */
  title?: string;
  children?: SidebarItem[];
}

export interface SidebarBrand {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
}

export interface SidebarProps {
  items: SidebarItem[];
  activeId: string;
  onSelect: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  brand?: SidebarBrand;
  /** Footer slot. A render prop receives the current collapsed state. */
  footer?: ReactNode | ((collapsed: boolean) => ReactNode);
  width?: number;
  collapsedWidth?: number;
  collapseLabel?: string;
  expandLabel?: string;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
  /**
   * Compact/mobile drawer state. When provided it overrides `collapsed` as the
   * open state of the overlay drawer on narrow viewports.
   */
  mobileOpen?: boolean;
  /** Called when the drawer should close: backdrop, close button, Escape or item selection. */
  onMobileClose?: () => void;
  /** Viewport width (px) below which the sidebar switches to the overlay drawer. */
  compactBreakpoint?: number;
  /** Accessible label/title of the drawer close button. */
  closeLabel?: string;
}

// 256/80 keep the rail centred: 12px item padding + 8px row padding leaves a
// 40px box for the icon, which is the width the rail hugs.
const DEFAULT_WIDTH = 256;
const DEFAULT_COLLAPSED_WIDTH = 80;
const DEFAULT_CLOSE_LABEL = 'Close navigation';

function isItemActive(item: SidebarItem, activeId: string): boolean {
  return item.id === activeId || Boolean(item.children?.some((child) => child.id === activeId));
}

/**
 * Chevrons for the collapse toggle, drawn inline: the package ships no icon
 * dependency, and a glyph character would scale with the consumer's font.
 */
function ToggleGlyph({ direction }: { direction: 'left' | 'right' | 'close' }) {
  if (direction === 'close') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={direction === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  );
}

/**
 * Collapsible application sidebar: brand slot, optional one-level groups,
 * active item highlighting and a footer slot. Labels/icons are injected, so no
 * product branding or navigation content lives in the library.
 *
 * Below `compactBreakpoint` the sidebar becomes an overlay drawer with a
 * backdrop, scroll lock, Escape-to-close and full labels regardless of
 * `collapsed`. Desktop rendering is unchanged.
 */
export default function Sidebar({
  items,
  activeId,
  onSelect,
  collapsed,
  onToggle,
  brand,
  footer,
  width = DEFAULT_WIDTH,
  collapsedWidth = DEFAULT_COLLAPSED_WIDTH,
  collapseLabel = 'Collapse sidebar',
  expandLabel = 'Expand sidebar',
  ariaLabel = 'Main navigation',
  className,
  style,
  mobileOpen,
  onMobileClose,
  compactBreakpoint = DEFAULT_COMPACT_BREAKPOINT,
  closeLabel = DEFAULT_CLOSE_LABEL,
}: SidebarProps) {
  const generatedId = useId();
  const isCompact = useIsCompact(compactBreakpoint);
  // A controlled drawer (`mobileOpen` provided) fully owns its state. Otherwise the
  // drawer keeps its own copy, so the backdrop and the close button can dismiss it
  // even when the consumer passes no `onMobileClose`.
  const isControlled = mobileOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(!collapsed);
  const isOpen = isControlled ? (mobileOpen as boolean) : uncontrolledOpen;
  // `rail` is the desktop collapsed state; the drawer always renders expanded.
  const rail = !isCompact && collapsed;
  const drawerOpen = isCompact && isOpen;

  // Closing always notifies the consumer; only an uncontrolled drawer moves itself.
  const requestClose = useCallback(() => {
    if (!isControlled) setUncontrolledOpen(false);
    onMobileClose?.();
  }, [isControlled, onMobileClose]);

  // There is no `onMobileOpen` prop: a controlled drawer reports the intent through
  // `onToggle`, an uncontrolled one simply opens itself.
  const requestOpen = useCallback(() => {
    if (isControlled) onToggle();
    else setUncontrolledOpen(true);
  }, [isControlled, onToggle]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const item of items) {
      if (item.children?.length && isItemActive(item, activeId)) initial[item.id] = true;
    }
    return initial;
  });

  const activeGroupId = items.find(
    (item) => item.children?.length && item.children.some((child) => child.id === activeId),
  )?.id;

  useEffect(() => {
    if (!activeGroupId) return;
    setOpenGroups((current) =>
      current[activeGroupId] ? current : { ...current, [activeGroupId]: true },
    );
  }, [activeGroupId]);

  // Escape closes the drawer without collapsing anything on desktop.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen, requestClose]);

  // Lock page scroll while the drawer is open, restoring the previous value.
  useEffect(() => {
    if (!drawerOpen) return;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

  const toggleGroup = (item: SidebarItem) => {
    if (rail) {
      onToggle();
      setOpenGroups((current) => ({ ...current, [item.id]: true }));
      return;
    }
    setOpenGroups((current) => ({ ...current, [item.id]: !current[item.id] }));
  };

  const select = (id: string) => {
    onSelect(id);
    if (isCompact) requestClose();
  };

  const handleToggleClick = () => {
    if (isCompact) {
      if (isOpen) requestClose();
      else requestOpen();
      return;
    }
    onToggle();
  };

  const toggleDirection = isCompact ? 'close' : rail ? 'right' : 'left';
  const toggleLabel = isCompact ? closeLabel : rail ? expandLabel : collapseLabel;

  return (
    <>
      {drawerOpen && (
        <div className="ui-sidebar-backdrop" aria-hidden="true" onClick={requestClose} />
      )}
      <nav
        aria-label={ariaLabel}
        className={[
          'ui-sidebar',
          isCompact ? 'is-compact' : rail ? 'is-collapsed' : '',
          drawerOpen ? 'is-open' : '',
          className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          ...(isCompact ? {} : { width: rail ? collapsedWidth : width }),
          ...style,
        }}
      >
        <div className="ui-sidebar-header">
          {brand && (
            <div className="ui-sidebar-brand">
              {brand.icon && <div className="ui-sidebar-brand-icon">{brand.icon}</div>}
              {/* Kept mounted in the rail so the width transition has something
                  to animate; `aria-hidden` keeps the name out of the a11y tree. */}
              <div className="ui-sidebar-brand-copy" aria-hidden={rail ? 'true' : undefined}>
                <div className="ui-sidebar-brand-title">{brand.title}</div>
                {brand.subtitle && (
                  <div className="ui-sidebar-brand-subtitle">{brand.subtitle}</div>
                )}
              </div>
            </div>
          )}
          <div className="ui-sidebar-toggle-row">
            <button
              type="button"
              className="ui-sidebar-toggle"
              aria-label={toggleLabel}
              title={toggleLabel}
              onClick={handleToggleClick}
            >
              <ToggleGlyph direction={toggleDirection} />
            </button>
          </div>
        </div>

        <div className="ui-sidebar-items">
          {items.map((item) => {
            const active = isItemActive(item, activeId);
            const hasChildren = Boolean(item.children?.length);
            const open = Boolean(openGroups[item.id]);
            const submenuId = `${generatedId}-${item.id}`;

            if (hasChildren) {
              return (
                <div key={item.id} className="ui-sidebar-group">
                  <button
                    type="button"
                    className={['ui-sidebar-item', active ? 'is-active' : '']
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => toggleGroup(item)}
                    title={item.title ?? item.label}
                    aria-expanded={!rail && open}
                    aria-controls={submenuId}
                  >
                    {item.icon && (
                      <span className="ui-sidebar-item-icon" aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    <span className="ui-sidebar-item-copy" aria-hidden={rail ? 'true' : undefined}>
                      <span className="ui-sidebar-item-label">{item.label}</span>
                      <span
                        className={['ui-sidebar-caret', open ? 'is-open' : '']
                          .filter(Boolean)
                          .join(' ')}
                        aria-hidden="true"
                      >
                        ▾
                      </span>
                    </span>
                  </button>
                  {!rail && open && (
                    <div id={submenuId} className="ui-sidebar-subitems">
                      {item.children?.map((child) => {
                        const childActive = child.id === activeId;
                        return (
                          <button
                            key={child.id}
                            type="button"
                            className={['ui-sidebar-subitem', childActive ? 'is-active' : '']
                              .filter(Boolean)
                              .join(' ')}
                            onClick={() => select(child.id)}
                            title={child.title ?? child.label}
                          >
                            {child.icon && (
                              <span className="ui-sidebar-item-icon" aria-hidden="true">
                                {child.icon}
                              </span>
                            )}
                            <span className="ui-sidebar-item-label">{child.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                className={['ui-sidebar-item', active ? 'is-active' : ''].filter(Boolean).join(' ')}
                onClick={() => select(item.id)}
                title={item.title ?? item.label}
              >
                {item.icon && (
                  <span className="ui-sidebar-item-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className="ui-sidebar-item-copy" aria-hidden={rail ? 'true' : undefined}>
                  <span className="ui-sidebar-item-label">{item.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {footer && (
          <div className="ui-sidebar-footer">
            {typeof footer === 'function' ? footer(rail) : footer}
          </div>
        )}
      </nav>
    </>
  );
}
