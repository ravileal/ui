import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { DEFAULT_COMPACT_BREAKPOINT, useIsCompact } from '../internal/useIsCompact';

/** Drawer state handed to the `sidebar` render prop and owned by `AppShell`. */
export interface AppShellDrawerState {
  mobileOpen: boolean;
  onMobileClose: () => void;
  onMobileOpen: () => void;
}

export interface AppBarProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  onNavClick?: () => void;
  /** aria-label + title of the trigger. Defaults to `Open navigation`. */
  navLabel?: string;
  /** Replaces the default hamburger glyph. */
  navIcon?: ReactNode;
  /** Pins the bar to the top of the scroll region. Defaults to `true`. */
  sticky?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface AppShellProps {
  /**
   * Sidebar slot. A render prop receives the drawer state so the consumer can
   * drive `Sidebar`'s controlled `mobileOpen` / `onMobileClose` props.
   */
  sidebar: ReactNode | ((state: AppShellDrawerState) => ReactNode);
  children: ReactNode;
  /** Overlay slot (chat launcher, FAB): rendered outside the scroll region. */
  aside?: ReactNode;
  /** Compact bar title, shown only below `compactBreakpoint`. */
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Viewport width (px) below which the compact bar appears. */
  compactBreakpoint?: number;
  navLabel?: string;
  /** Max width of the centered content column. */
  contentWidth?: number;
  /** Landmark label for `<main>`. */
  ariaLabel?: string;
  className?: string;
  contentClassName?: string;
  style?: CSSProperties;
}

const DEFAULT_NAV_LABEL = 'Open navigation';
const DEFAULT_ARIA_LABEL = 'Main content';

/**
 * Default trigger glyph. Inline so the library ships no icon dependency; it
 * inherits the button colour through `currentColor`.
 */
function NavIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

/**
 * Compact header bar: one trigger that opens the navigation drawer, a title /
 * subtitle copy block and an actions slot. Rendered by `AppShell` below
 * `compactBreakpoint`, but usable on its own.
 */
export function AppBar({
  title,
  subtitle,
  actions,
  onNavClick,
  navLabel = DEFAULT_NAV_LABEL,
  navIcon,
  sticky = true,
  className,
  style,
}: AppBarProps) {
  return (
    <div
      className={['ui-app-bar', sticky ? 'is-sticky' : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {onNavClick && (
        <button
          type="button"
          className="ui-app-bar-nav"
          aria-label={navLabel}
          title={navLabel}
          onClick={onNavClick}
        >
          {navIcon ?? <NavIcon />}
        </button>
      )}
      <div className="ui-app-bar-copy">
        {title != null && <div className="ui-app-bar-title">{title}</div>}
        {subtitle != null && <div className="ui-app-bar-subtitle">{subtitle}</div>}
      </div>
      {actions != null && <div className="ui-app-bar-actions">{actions}</div>}
    </div>
  );
}

/**
 * Application shell: sidebar on the left, `<main>` column on the right and an
 * overlay `aside` sibling for floating widgets.
 *
 * The shell only provides the frame. Screens inside keep owning their own
 * scroll region, so `children` is never wrapped in a scroller.
 *
 * Below `compactBreakpoint` the sidebar becomes an off-canvas drawer (that
 * behaviour lives in `Sidebar`) and a compact `AppBar` appears at the top with
 * the only trigger that can reopen it.
 */
export default function AppShell({
  sidebar,
  children,
  aside,
  title,
  subtitle,
  actions,
  compactBreakpoint = DEFAULT_COMPACT_BREAKPOINT,
  navLabel,
  contentWidth,
  ariaLabel = DEFAULT_ARIA_LABEL,
  className,
  contentClassName,
  style,
}: AppShellProps) {
  const isCompact = useIsCompact(compactBreakpoint);
  const [mobileOpen, setMobileOpen] = useState(false);

  const onMobileOpen = useCallback(() => setMobileOpen(true), []);
  const onMobileClose = useCallback(() => setMobileOpen(false), []);

  // A drawer opened on a phone must not survive the rotation to a desktop
  // width (or a window resize): the drawer is not rendered there, so a stale
  // `true` would reopen it the moment the viewport narrows again.
  useEffect(() => {
    if (isCompact) return;
    setMobileOpen((current) => (current ? false : current));
  }, [isCompact]);

  const drawerState: AppShellDrawerState = { mobileOpen, onMobileClose, onMobileOpen };

  return (
    <div className={['ui-app-shell', className ?? ''].filter(Boolean).join(' ')} style={style}>
      {typeof sidebar === 'function' ? sidebar(drawerState) : sidebar}
      <main className="ui-app-shell-main" aria-label={ariaLabel}>
        {isCompact && (
          <AppBar
            title={title}
            subtitle={subtitle}
            actions={actions}
            navLabel={navLabel}
            onNavClick={onMobileOpen}
          />
        )}
        <div
          className={['ui-app-shell-content', contentClassName ?? ''].filter(Boolean).join(' ')}
          style={
            contentWidth ? { maxWidth: contentWidth, width: '100%', margin: '0 auto' } : undefined
          }
        >
          {children}
        </div>
      </main>
      {aside != null && <div className="ui-app-shell-aside">{aside}</div>}
    </div>
  );
}
