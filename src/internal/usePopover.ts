import { useCallback, useEffect, useRef, useState } from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export interface PopoverPosition {
  left: number;
  top?: number;
  bottom?: number;
  /** Fixed menu width; omitted when the menu shrinks to its content. */
  width?: number;
  maxHeight: number;
}

/**
 * Shared popover behavior for custom dropdowns/date pickers: anchors a portaled
 * menu to its trigger, flips above when there is no room below, repositions on
 * scroll/resize and closes on outside click or Escape.
 */
export function usePopover({
  maxHeight,
  minWidth = 160,
  fitContent = false,
  onEscape,
  onDismiss,
}: {
  maxHeight: number;
  minWidth?: number;
  /** Let the menu shrink to its content instead of matching the trigger width. */
  fitContent?: boolean;
  /** Return true to handle Escape without closing the popover (e.g. collapse a submenu). */
  onEscape?: () => boolean | void;
  /** Called when the popover is dismissed by an outside click or Escape (before closing). */
  onDismiss?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PopoverPosition>({
    left: 0,
    top: 0,
    width: fitContent ? undefined : minWidth,
    maxHeight,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  const reposition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const viewportH = window.innerHeight || 0;
    const viewportW = window.innerWidth || 0;
    const spaceBelow = viewportH - rect.bottom;
    const openUp = spaceBelow < maxHeight + 8 && rect.top > spaceBelow;
    const menuWidth = fitContent
      ? Math.max(menuRef.current?.offsetWidth ?? minWidth, minWidth)
      : Math.max(rect.width, minWidth);
    // A content-sized menu anchors to the trigger's right edge when the trigger
    // is wider (e.g. a date field next to a calendar icon at its right end).
    let left = fitContent && rect.width > menuWidth ? rect.right - menuWidth : rect.left;
    left = Math.min(Math.max(left, 8), Math.max(viewportW - menuWidth - 8, 8));
    setPos({
      left,
      top: openUp ? undefined : rect.bottom + 4,
      bottom: openUp ? Math.max(viewportH - rect.top + 4, 4) : undefined,
      width: fitContent ? undefined : menuWidth,
      maxHeight,
    });
  }, [fitContent, maxHeight, minWidth]);

  const openMenu = useCallback(() => setOpen(true), []);
  const closeMenu = useCallback((refocus = false) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (open) reposition();
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      dismissRef.current?.();
      closeMenu();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (onEscape?.()) return;
      dismissRef.current?.();
      closeMenu(true);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [open, closeMenu, reposition, onEscape]);

  return { open, pos, triggerRef, menuRef, openMenu, closeMenu };
}
