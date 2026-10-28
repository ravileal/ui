import type { CSSProperties } from 'react';
import TextInput from './TextInput';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  placeholder?: string;
  onClear?: () => void;
  clearLabel?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="4.25" />
      <path d="m9.2 9.2 3 3" />
    </svg>
  );
}

export default function SearchInput({
  value,
  onChange,
  ariaLabel,
  placeholder = 'Search',
  onClear,
  clearLabel = 'Clear search',
  disabled = false,
  className,
  style,
}: SearchInputProps) {
  return (
    <TextInput
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={ariaLabel}
      placeholder={placeholder}
      leadingIcon={<SearchIcon />}
      onClear={value ? (onClear ?? (() => onChange(''))) : undefined}
      clearLabel={clearLabel}
      disabled={disabled}
      className={className}
      style={style}
    />
  );
}
