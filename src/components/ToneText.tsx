import type { CSSProperties, ElementType, ReactNode } from 'react';
import type { Tone } from '../internal/tone';

export type ToneTextElement = 'span' | 'strong' | 'em' | 'p' | 'div';

export type ToneTextSize = 'sm' | 'md';

export type ToneTextWeight = 'medium' | 'semibold';

export interface ToneTextProps {
  children: ReactNode;
  tone?: Tone;
  /** `md` is the row scale (12.5px), `sm` the last-result scale (11.5px). */
  size?: ToneTextSize;
  weight?: ToneTextWeight;
  /** Tabular figures, for a value that sits in a column of numbers. */
  tabular?: boolean;
  as?: ToneTextElement;
  title?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * A single state word coloured by tone. It carries no background or padding:
 * the callers that need a pill use Badge, and this stays a word in a sentence
 * or in a table cell.
 */
export default function ToneText({
  children,
  tone = 'neutral',
  size = 'md',
  weight = 'semibold',
  tabular = false,
  as = 'span',
  title,
  className,
  style,
}: ToneTextProps) {
  const Tag: ElementType = as;

  return (
    <Tag
      className={[
        'ui-tone-text',
        `ui-tone-text--${tone}`,
        `ui-tone-text--${size}`,
        `ui-tone-text--${weight}`,
        tabular ? 'ui-tone-text--tabular' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      title={title}
      style={style}
    >
      {children}
    </Tag>
  );
}
