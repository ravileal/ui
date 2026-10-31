import type { CSSProperties, ReactNode } from 'react';

import Button, { type ButtonSize, type ButtonVariant } from './Button';
import { DropdownMenu, type DropdownMenuEntry } from './DropdownMenu';

export interface SplitButtonProps {
  /** Label rendered in the primary action. */
  label: ReactNode;
  /** Primary action (the left half of the button). */
  onPrimary: () => void;
  /** Secondary actions shown in the caret menu. */
  items: DropdownMenuEntry[];
  /** Accessible name for the caret menu trigger. */
  ariaLabel: string;
  leadingIcon?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Primary action plus a caret menu, visually joined into one control. The caret
 * keeps the same variant/size tokens as the main Button, and the menu surface
 * grows out of the button: no gap, no border between the halves, and item rows
 * that reuse the main button's background for the current variant.
 */
export default function SplitButton({
  label,
  onPrimary,
  items,
  ariaLabel,
  leadingIcon,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  style,
}: SplitButtonProps) {
  return (
    <div
      className={['ui-split-button', `ui-split-button--${variant}`, className]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <Button
        variant={variant}
        size={size}
        leadingIcon={leadingIcon}
        disabled={disabled}
        onClick={onPrimary}
        className="ui-split-button-main"
      >
        {label}
      </Button>
      <DropdownMenu
        ariaLabel={ariaLabel}
        align="end"
        items={items}
        disabled={disabled}
        trigger={null}
        triggerClassName={[
          'ui-button',
          `ui-button--${variant}`,
          `ui-button--${size}`,
          'ui-split-button-caret',
        ].join(' ')}
      />
    </div>
  );
}
