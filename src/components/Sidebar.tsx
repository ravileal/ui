import { useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react';

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
}

const DEFAULT_WIDTH = 220;
const DEFAULT_COLLAPSED_WIDTH = 64;

function isItemActive(item: SidebarItem, activeId: string): boolean {
  return item.id === activeId || Boolean(item.children?.some((child) => child.id === activeId));
}

/**
 * Collapsible application sidebar: brand slot, optional one-level groups,
 * active item highlighting and a footer slot. Labels/icons are injected, so no
 * product branding or navigation content lives in the library.
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
}: SidebarProps) {
  const generatedId = useId();
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

  const toggleGroup = (item: SidebarItem) => {
    if (collapsed) {
      onToggle();
      setOpenGroups((current) => ({ ...current, [item.id]: true }));
      return;
    }
    setOpenGroups((current) => ({ ...current, [item.id]: !current[item.id] }));
  };

  return (
    <nav
      aria-label={ariaLabel}
      className={['ui-sidebar', collapsed ? 'is-collapsed' : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
      style={{
        width: collapsed ? collapsedWidth : width,
        ...style,
      }}
    >
      <div className="ui-sidebar-header">
        {brand && (
          <div className="ui-sidebar-brand">
            {brand.icon && <div className="ui-sidebar-brand-icon">{brand.icon}</div>}
            {!collapsed && (
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
            aria-label={collapsed ? expandLabel : collapseLabel}
            title={collapsed ? expandLabel : collapseLabel}
            onClick={onToggle}
          >
            {collapsed ? '»' : '«'}
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
                  aria-expanded={!collapsed && open}
                  aria-controls={submenuId}
                >
                  {item.icon && (
                    <span className="ui-sidebar-item-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  {!collapsed && <span className="ui-sidebar-item-label">{item.label}</span>}
                  {!collapsed && (
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
                {!collapsed && open && (
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
                          onClick={() => onSelect(child.id)}
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
              onClick={() => onSelect(item.id)}
              title={item.title ?? item.label}
            >
              {item.icon && (
                <span className="ui-sidebar-item-icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              {!collapsed && <span className="ui-sidebar-item-label">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {footer && (
        <div className="ui-sidebar-footer">
          {typeof footer === 'function' ? footer(collapsed) : footer}
        </div>
      )}
    </nav>
  );
}
