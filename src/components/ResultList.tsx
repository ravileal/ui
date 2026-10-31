import { Children, type CSSProperties, type ReactNode } from 'react';
import MediaThumb, { type MediaThumbSize } from './MediaThumb';

export interface ResultListProps {
  children: ReactNode;
  emptyLabel?: string;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

export interface ResultRowMedia {
  src: string | null;
  initials: string;
  alt?: string;
  size?: MediaThumbSize;
}

export interface ResultRowProps {
  media?: ResultRowMedia;
  primary: ReactNode;
  secondary?: string[];
  meta?: ReactNode;
  action?: ReactNode;
  onClick?: () => void;
  className?: string;
}

/** Vertical list of result rows, with an optional placeholder when it is empty. */
export function ResultList({ children, emptyLabel, ariaLabel, className, style }: ResultListProps) {
  const isEmpty = Children.count(children) === 0;

  return (
    <ul
      className={['ui-result-list', className ?? ''].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
      style={style}
    >
      {isEmpty ? emptyLabel && <li className="ui-result-list-empty">{emptyLabel}</li> : children}
    </ul>
  );
}

/** One row of a `ResultList`: media, primary/secondary text, meta and a trailing action. */
export function ResultRow({
  media,
  primary,
  secondary,
  meta,
  action,
  onClick,
  className,
}: ResultRowProps) {
  return (
    <li
      className={['ui-result-row', onClick ? 'is-clickable' : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {media && (
        <span className="ui-result-row-media">
          <MediaThumb
            src={media.src}
            alt={media.alt}
            initials={media.initials}
            size={media.size ?? 'sm'}
          />
        </span>
      )}
      <div className="ui-result-row-text">
        <span className="ui-result-row-primary">{primary}</span>
        {secondary
          ?.filter((line) => line !== '')
          .map((line, index) => (
            <span className="ui-result-row-secondary" key={`${index}-${line}`}>
              {line}
            </span>
          ))}
        {meta && <span className="ui-result-row-meta">{meta}</span>}
      </div>
      {action && (
        // Keep the action from also triggering the row's own click handler.
        <div className="ui-result-row-action" onClick={(event) => event.stopPropagation()}>
          {action}
        </div>
      )}
    </li>
  );
}
