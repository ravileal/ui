import { useEffect, useRef, type CSSProperties } from 'react';
import { SegmentedControl } from './SegmentedControl';
import type { ItemGridLayout } from './ItemGrid';

export interface ViewSwitcherProps {
  value: ItemGridLayout;
  onChange: (value: ItemGridLayout) => void;
  layouts?: ItemGridLayout[];
  labels?: Partial<Record<ItemGridLayout, string>>;
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
 */
export function ViewSwitcher({
  value,
  onChange,
  layouts = DEFAULT_LAYOUTS,
  labels,
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
  // `value` and could fire `onChange` in a loop.
  useEffect(() => {
    if (!storageKey) return;
    const stored = readStoredLayout(storageKey);
    if (!stored) return;
    const known = layoutsRef.current.includes(stored as ItemGridLayout);
    if (known && stored !== valueRef.current) {
      onChangeRef.current(stored as ItemGridLayout);
    }
  }, [storageKey]);

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
      items={layouts.map((layout) => ({
        value: layout,
        label: labels?.[layout] ?? DEFAULT_LABELS[layout],
      }))}
    />
  );
}

export default ViewSwitcher;
