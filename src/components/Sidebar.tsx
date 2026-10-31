import {
  useCallback,
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from 'react';

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

const DEFAULT_WIDTH = 220;
const DEFAULT_COLLAPSED_WIDTH = 64;
const DEFAULT_COMPACT_BREAKPOINT = 640;
const DEFAULT_CLOSE_LABEL = 'Close navigation';

function isItemActive(item: SidebarItem, activeId: string): boolean {
  return item.id === activeId || Boolean(item.children?.some((child) => child.id === activeId));
}

function getMatchMedia(breakpoint: number): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  return window.matchMedia(`(max-width: ${breakpoint}px)`);
}

/**
 * Tracks whether the viewport is narrower than `breakpoint` using
 * `useSyncExternalStore`, so SSR and hydration use a stable `false` snapshot.
 */
function useIsCompact(breakpoint: number): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const query = getMatchMedia(breakpoint);
      if (!query) return () => {};
      query.addEventListener('change', onStoreChange);
      return () => query.removeEventListener('change', onStoreChange);
    },
    [breakpoint],
  );

  const getSnapshot = useCallback(() => getMatchMedia(breakpoint)?.matches ?? false, [breakpoint]);
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
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
  const isOpen = mobileOpen ?? !collapsed;
  // `rail` is the desktop collapsed state; the drawer always renders expanded.
  const rail = !isCompact && collapsed;
  const drawerOpen = isCompact && isOpen;

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
      if (event.key === 'Escape') onMobileClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen, onMobileClose]);

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
    if (isCompact) onMobileClose?.();
  };

  const handleToggleClick = () => {
    if (isCompact) {
      if (isOpen) onMobileClose?.();
      else onToggle();
      return;
    }
    onToggle();
  };

  const toggleGlyph = isCompact ? '×' : rail ? '»' : '«';
  const toggleLabel = isCompact ? closeLabel : rail ? expandLabel : collapseLabel;

  return (
    <>
      {drawerOpen && (
        <div className="ui-sidebar-backdrop" aria-hidden="true" onClick={onMobileClose} />
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
              {!rail && (
                <div className="ui-sidebar-brand-copy">
                  <div className="ui-sidebar-brand-title">{brand.title}</div>
                  {brand.subtitle && (
                    <div className="ui-sidebar-brand-subtitle">{brand.subtitle}</div>
                  )}
                </div>
              )}
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
              {toggleGlyph}
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
                    {!rail && <span className="ui-sidebar-item-label">{item.label}</span>}
                    {!rail && (
                      <span
                        className={['ui-sidebar-caret', open ? 'is-open' : '']
                          .filter(Boolean)
                          .join(' ')}
                        aria-hidden="true"
                      >
                        ▾
                      </span>
                    )}
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
                {!rail && <span className="ui-sidebar-item-label">{item.label}</span>}
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
