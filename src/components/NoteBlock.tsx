import type { CSSProperties, ReactNode } from 'react';
import type { Tone } from '../internal/tone';

export interface NoteBlockLine {
  /** Prefix that names what the detail is, e.g. `Webhook target`. */
  label?: string;
  value: ReactNode;
  /** Monospace value (the default) — URLs, probe payloads, error bodies. */
  mono?: boolean;
  /** Value colour; `neutral` keeps the default. */
  tone?: Tone;
  /** Native tooltip for a value that wraps past a couple of lines. */
  title?: string;
  /** Stable key; the index is used when omitted. */
  key?: string | number;
}

export interface NoteBlockProps {
  /** The note itself — muted supporting text. */
  children?: ReactNode;
  /** Optional caption above the note, e.g. `Last run`. */
  title?: ReactNode;
  /** Colour of the note; a line can override it with its own `tone`. */
  tone?: Tone;
  /** Sets the note body in monospace, for a note that is itself an output. */
  mono?: boolean;
  /** Detail lines under the note. A bare string is a value with no label. */
  lines?: Array<string | NoteBlockLine>;
  className?: string;
  style?: CSSProperties;
}

function toLine(line: string | NoteBlockLine): NoteBlockLine {
  return typeof line === 'string' ? { value: line } : line;
}

/**
 * A muted note with optional monospace detail lines beneath it: the footer of a
 * detail sheet, where the prose explains and the lines carry the raw target,
 * probe detail or last error. Long unbroken values break anywhere instead of
 * pushing the block wider than its container.
 */
export default function NoteBlock({
  children,
  title,
  tone = 'neutral',
  mono = false,
  lines,
  className,
  style,
}: NoteBlockProps) {
  const hasNote = children !== undefined && children !== null;

  return (
    <div
      className={[
        'ui-note-block',
        tone !== 'neutral' ? `ui-note-block--${tone}` : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {title && <div className="ui-note-block-title">{title}</div>}
      {hasNote && (
        <div
          className={['ui-note-block-note', mono ? 'ui-note-block-note--mono' : '']
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </div>
      )}
      {lines && lines.length > 0 && (
        <ul className="ui-note-block-lines">
          {lines.map((raw, index) => {
            const line = toLine(raw);
            return (
              <li className="ui-note-block-line" key={line.key ?? index}>
                {line.label && <span className="ui-note-block-line-label">{line.label}</span>}
                <span
                  className={[
                    'ui-note-block-line-value',
                    line.mono === false ? '' : 'ui-note-block-line-value--mono',
                    line.tone && line.tone !== 'neutral'
                      ? `ui-note-block-line-value--${line.tone}`
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  title={line.title}
                >
                  {line.value}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
