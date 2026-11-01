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
   * Icon per layout. A layout with an icon renders an icon-only segment whose
   * accessible name still comes from `labels` (or the default label); a layout
   * without one keeps the text label.
   */
  icons?: Partial<Record<ItemGridLayout, ReactNode>>;
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
 */
export function ViewSwitcher({
  value,
  onChange,
  layouts = DEFAULT_LAYOUTS,
  labels,
  icons,
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

  if (layouts.length === 1) {
    const only = layouts[0] as ItemGridLayout;
    const onlyIcon = icons?.[only];
    return (
      <div
        className={['ui-view-switcher-fixed', className ?? ''].filter(Boolean).join(' ')}
        style={style}
        data-layout={only}
        title={ariaLabel}
      >
        {onlyIcon != null ? (
          <span className="ui-view-switcher-icon" aria-hidden="true">
            {onlyIcon}
          </span>
        ) : (
          (labels?.[only] ?? DEFAULT_LABELS[only])
        )}
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
      size="sm"
      ariaLabel={ariaLabel}
      value={value}
      onChange={handleChange}
      className={className}
      style={style}
      items={layouts.map((layout) => {
        const label = labels?.[layout] ?? DEFAULT_LABELS[layout];
        const icon = icons?.[layout];
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
