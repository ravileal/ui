import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';
import { useIsomorphicLayoutEffect } from '../internal/useIsomorphicLayoutEffect';

export interface TooltipProps {
  /** Panel content — usually the raw value an alias is covering. */
  content: ReactNode;
  children: ReactNode;
  maxWidth?: number;
  /** Delay before showing, in ms (0 shows immediately — used by tests). */
  delay?: number;
  /** Extra style for the trigger wrapper (e.g. `flex: 1` to wrap a Dropdown). */
  style?: CSSProperties;
  className?: string;
  /** Suppresses the panel (e.g. while the wrapped dropdown is open). */
  disabled?: boolean;
  /** Trigger element; use `div` when wrapping block content (e.g. a dropdown option). */
  as?: 'span' | 'div';
}

const GAP = 8;

/**
 * Custom design-system tooltip: renders the panel in a portal (rows clip with
 * `overflow: hidden`, so a nested panel would be cut), flips above/below the
 * trigger based on available space and clamps to the viewport horizontally.
 */
export default function Tooltip({
  content,
  children,
  maxWidth = 260,
  delay = 120,
  style,
  className,
  disabled = false,
  as = 'span',
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number; below: boolean }>({
    left: 0,
    top: 0,
    below: false,
  });
  const triggerRef = useRef<HTMLSpanElement | HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoveredRef = useRef(false);
  const tooltipId = useId();

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Never let the panel exceed the viewport: the panel keeps its content width
  // (`max-content`, otherwise the browser shrinks it to the longest word when
  // the trigger sits near the right edge) and is clamped by this max-width.
  const panelMaxWidth = Math.min(
    maxWidth,
    Math.max(0, (viewportWidth ?? maxWidth + GAP * 2) - GAP * 2),
  );

  const position = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;
    const rect = trigger.getBoundingClientRect();
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    const half = width / 2;
    const left = Math.min(
      Math.max(rect.left + rect.width / 2, half + GAP),
      window.innerWidth - half - GAP,
    );
    const spaceAbove = rect.top - GAP;
    const spaceBelow = window.innerHeight - rect.bottom - GAP;
    // Prefer above the trigger; only drop below when the panel does not fit
    // above. If it fits in neither direction, use the larger side.
    const fitsAbove = spaceAbove >= height;
    const fitsBelow = spaceBelow >= height;
    const below = !fitsAbove && (fitsBelow || spaceBelow >= spaceAbove);
    setPos({ left, top: below ? rect.bottom + GAP : rect.top - GAP, below });
  }, []);

  const show = useCallback(() => {
    if (disabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (delay <= 0) {
      setOpen(true);
      return;
    }
    timerRef.current = setTimeout(() => setOpen(true), delay);
  }, [delay, disabled]);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(false);
  }, []);

  useEffect(() => {
    if (disabled) hide();
  }, [disabled, hide]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, hide]);

  useIsomorphicLayoutEffect(() => {
    if (open) position();
  }, [open, position]);

  useEffect(() => {
    if (!open) return;
    const reposition = () => position();
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [open, position]);

  const wrapperStyle = {
    display: as === 'div' ? 'block' : 'inline-flex',
    minWidth: 0,
    maxWidth: '100%',
    ...style,
  };
  const handlers = {
    onMouseEnter: () => {
      hoveredRef.current = true;
      show();
    },
    onMouseLeave: () => {
      hoveredRef.current = false;
      hide();
    },
    onFocus: show,
    onBlur: () => {
      // The legacy clipboard fallback steals focus to a hidden textarea; while
      // the pointer is still over the trigger the panel must stay open.
      if (!hoveredRef.current) hide();
    },
  };
  const panel =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={panelRef}
            id={tooltipId}
            role="tooltip"
            className="ui-tooltip"
            style={{
              left: pos.left,
              top: pos.top,
              width: 'max-content',
              maxWidth: panelMaxWidth,
              overflowWrap: 'break-word',
              transform: pos.below ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
            }}
          >
            {content}
          </div>,
          document.body,
        )
      : null;

  if (as === 'div') {
    return (
      <div
        ref={triggerRef as Ref<HTMLDivElement>}
        className={className}
        style={wrapperStyle}
        aria-describedby={open ? tooltipId : undefined}
        {...handlers}
      >
        {children}
        {panel}
      </div>
    );
  }

  return (
    <span
      ref={triggerRef as Ref<HTMLSpanElement>}
      className={className}
      style={wrapperStyle}
      aria-describedby={open ? tooltipId : undefined}
      {...handlers}
    >
      {children}
      {panel}
    </span>
  );
}
