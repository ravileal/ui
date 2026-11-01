import type { CSSProperties, ReactNode } from 'react';

export interface AppHeaderProps {
  /** Product name. Pass a link for in-app navigation; the header never guesses the route. */
  brand: ReactNode;
  /** Section switcher for the middle of the bar: a `SegmentedControl`, `Tabs` or a set of links. */
  nav?: ReactNode;
  /** Read-only status chips on the right (library path, indexers, version). Hidden on narrow screens. */
  meta?: ReactNode;
  /** Primary controls that stay reachable from every screen. */
  actions?: ReactNode;
  /** Pins the bar to the top of the scroll region. Defaults to `true`. */
  sticky?: boolean;
  /** Accessible name of the `<header>` landmark. Defaults to `Application header`. */
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_ARIA_LABEL = 'Application header';

/**
 * Application header: the brand, the section switcher, the status chips and the
 * primary actions on one sticky bar.
 *
 * It is the sibling of `PageHeader`, not a replacement: the header names the
 * product and moves between sections, while `PageHeader` names the current
 * screen and carries its actions. Below `720px` the switcher drops to its own
 * row instead of being hidden, so navigation never disappears on a phone; the
 * status chips are the only part that goes away.
 */
export default function AppHeader({
  brand,
  nav,
  meta,
  actions,
  sticky = true,
  ariaLabel = DEFAULT_ARIA_LABEL,
  className,
  style,
}: AppHeaderProps) {
  return (
    <header
      className={['ui-app-header', sticky ? 'is-sticky' : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
      style={style}
      aria-label={ariaLabel}
    >
      <div className="ui-app-header-inner">
        <div className="ui-app-header-brand">{brand}</div>
        {nav != null && <div className="ui-app-header-nav">{nav}</div>}
        {/* The spacer keeps the meta/actions cluster against the far edge even
            when the brand is short. */}
        <div className="ui-app-header-spacer" aria-hidden="true" />
        {meta != null && <div className="ui-app-header-meta">{meta}</div>}
        {actions != null && <div className="ui-app-header-actions">{actions}</div>}
      </div>
    </header>
  );
}
