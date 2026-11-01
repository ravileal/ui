import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { SegmentedControl } from './SegmentedControl';
import type { ItemGridLayout } from './ItemGrid';

export interface ViewSwitcherProps {
  value: ItemGridLayout;
  onChange: (value: ItemGridLayout) => void;
  /**
   * The layouts the menu offers. Pass a subset to hide an option, `[]` to hide
   * the menu entirely (the screen is locked to a layout), or a single entry to
   * show that layout as a fixed, non-interactive indicator.
   */
  layouts?: ItemGridLayout[];
  labels?: Partial<Record<ItemGridLayout, string>>;
  /**
   * Icon per layout, overriding the glyph the switcher already ships for that
   * layout. The segment keeps `labels` (or the default label) as its accessible
   * name and `title` either way.
   */
  icons?: Partial<Record<ItemGridLayout, ReactNode>>;
  /**
   * Size of the segmented bar. It is the `Button` height of the same size, so
   * `md` (the default) lines the switcher up with a default `Button`.
   */
  size?: 'sm' | 'md' | 'lg';
  /** Renders the words instead of the glyphs, for a bar that has the room. */
  showLabels?: boolean;
  ariaLabel?: string;
  /** When set, the last choice is remembered in localStorage under this key and restored on mount. */
  storageKey?: string;
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_LAYOUTS: ItemGridLayout[] = ['grid', 'list', 'adaptive'];

const DEFAULT_LABELS: Record<ItemGridLayout, string> = {
  grid: 'Grid',
  list: 'List',
  adaptive: 'Adaptive',
};

/**
 * Glyphs the switcher ships itself: the package takes no icon dependency, so
 * every known layout carries a 16px inline `<svg>` stroked with `currentColor`
 * and sized by `.ui-view-switcher-icon`.
 */
const GLYPH_PROPS = {
  viewBox: '0 0 16 16',
  width: 16,
  height: 16,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  focusable: 'false',
  'aria-hidden': true,
} as const;

const DEFAULT_GLYPHS: Record<ItemGridLayout, ReactNode> = {
  grid: (
    <svg {...GLYPH_PROPS}>
      <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1.2" />
      <rect x="9" y="2.5" width="4.5" height="4.5" rx="1.2" />
      <rect x="2.5" y="9" width="4.5" height="4.5" rx="1.2" />
      <rect x="9" y="9" width="4.5" height="4.5" rx="1.2" />
    </svg>
  ),
  list: (
    <svg {...GLYPH_PROPS}>
      <path d="M2.5 4h11M2.5 8h11M2.5 12h11" />
    </svg>
  ),
  adaptive: (
    <svg {...GLYPH_PROPS}>
      <rect x="2.5" y="2.5" width="4.5" height="11" rx="1.2" />
      <rect x="9" y="2.5" width="4.5" height="6" rx="1.2" />
      <rect x="9" y="10.5" width="4.5" height="3" rx="1.2" />
    </svg>
  ),
};

function readStoredLayout(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Private mode or storage disabled: there is nothing to restore.
    return null;
  }
}

function writeStoredLayout(key: string, value: ItemGridLayout) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private mode or a full quota: the switcher still works for this session.
  }
}

/**
 * The layout menu for an `ItemGrid`, built on `SegmentedControl`. With a
 * `storageKey` the last choice survives a reload; the stored value is applied
 * once on mount, and only when it is a known layout and differs from `value`.
 *
 * The menu renders exactly the layouts it is given, so a screen can offer all
 * three, only two, or none at all: with no layouts there is nothing to choose
 * and the component renders nothing, and with one layout it renders a fixed
 * label instead of a one-option radio group nobody can change.
 *
 * The segments are icon-only by default — the package ships its own glyphs, so
 * a toolbar reads as small pictures instead of three words — while each segment
 * keeps `labels` (or the default label) as its accessible name and `title`.
 * `showLabels` brings the words back, and `size` matches the height of the
 * `Button` beside it.
 */
export function ViewSwitcher({
  value,
  onChange,
  layouts = DEFAULT_LAYOUTS,
  labels,
  icons,
  size = 'md',
  showLabels = false,
  ariaLabel = 'Item layout',
  storageKey,
  className,
  style,
}: ViewSwitcherProps) {
  const valueRef = useRef(value);
  valueRef.current = value;
  const layoutsRef = useRef(layouts);
  layoutsRef.current = layouts;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Mount-only restore: re-running on every render would fight the controlled
  // `value` and could fire `onChange` in a loop. A locked screen (one layout or
  // none) has nothing to restore.
  useEffect(() => {
    if (!storageKey || layoutsRef.current.length < 2) return;
    const stored = readStoredLayout(storageKey);
    if (!stored) return;
    const known = layoutsRef.current.includes(stored as ItemGridLayout);
    if (known && stored !== valueRef.current) {
      onChangeRef.current(stored as ItemGridLayout);
    }
  }, [storageKey]);

  // Locked screen: no option to choose, so no control and no landmark.
  if (layouts.length === 0) return null;

  const glyphFor = (layout: ItemGridLayout): ReactNode => icons?.[layout] ?? DEFAULT_GLYPHS[layout];

  if (layouts.length === 1) {
    const only = layouts[0] as ItemGridLayout;
    const onlyIcon = glyphFor(only);
    return (
      <div
        className={['ui-view-switcher-fixed', className ?? ''].filter(Boolean).join(' ')}
        style={style}
        data-layout={only}
        title={ariaLabel}
      >
        {onlyIcon != null && (
          <span className="ui-view-switcher-icon" aria-hidden="true">
            {onlyIcon}
          </span>
        )}
        {labels?.[only] ?? DEFAULT_LABELS[only]}
      </div>
    );
  }

  const handleChange = (next: string) => {
    const layout = next as ItemGridLayout;
    onChange(layout);
    if (storageKey) writeStoredLayout(storageKey, layout);
  };

  return (
    <SegmentedControl
      size={size}
      ariaLabel={ariaLabel}
      value={value}
      onChange={handleChange}
      className={className}
      style={style}
      items={layouts.map((layout) => {
        const label = labels?.[layout] ?? DEFAULT_LABELS[layout];
        const icon = showLabels ? null : glyphFor(layout);
        if (icon != null) {
          return {
            value: layout,
            label: (
              <span className="ui-view-switcher-icon" aria-hidden="true">
                {icon}
              </span>
            ),
            ariaLabel: label,
            iconOnly: true,
          };
        }
        return { value: layout, label };
      })}
    />
  );
}

export default ViewSwitcher;
