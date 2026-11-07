import type { CSSProperties, ReactNode } from 'react';

export interface FooterNoteProps {
  /** The product note itself: a name, a copyright line, a short disclaimer. */
  children?: ReactNode;
  /** Optional second line under the note: a version, a build hash, a couple of links. */
  meta?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * The closed page: one centred, muted 11px product note, optionally over a
 * second line of build metadata. It is a `<footer>` landmark, so a screen
 * reader can jump straight to it, and it never grows a border or a background
 * of its own beyond the hairline that separates it from the content above.
 */
export default function FooterNote({ children, meta, className, style }: FooterNoteProps) {
  return (
    <footer className={['ui-footer-note', className ?? ''].filter(Boolean).join(' ')} style={style}>
      {children != null && <div className="ui-footer-note-text">{children}</div>}
      {meta != null && <div className="ui-footer-note-meta">{meta}</div>}
    </footer>
  );
}
