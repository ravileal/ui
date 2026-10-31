import type { CSSProperties, ReactNode } from 'react';
import MediaThumb, { type MediaThumbSize } from './MediaThumb';

export interface MediaCardTitleLinkProps {
  href: string;
  className: string;
  children: ReactNode;
}

export type MediaCardOrientation = 'vertical' | 'horizontal';

export interface MediaCardProps {
  coverImage: string | null;
  initials: string;
  title: ReactNode;
  titleHref?: string;
  /** Router-agnostic escape hatch: render the title/cover link with your own router component. */
  renderTitleLink?: (props: MediaCardTitleLinkProps) => ReactNode;
  meta?: ReactNode;
  footer?: ReactNode;
  orientation?: MediaCardOrientation;
  thumbSize?: MediaThumbSize;
  className?: string;
  style?: CSSProperties;
}

const LEAD_LINK_CLASS = 'ui-media-card-lead is-link';

/**
 * Cover + title card with an optional metadata line and footer. The card can be
 * a link, but the footer stays a sibling of that link: interactive controls
 * (a Switch, a button) must never be nested inside an anchor.
 */
export default function MediaCard({
  coverImage,
  initials,
  title,
  titleHref,
  renderTitleLink,
  meta,
  footer,
  orientation = 'vertical',
  thumbSize,
  className,
  style,
}: MediaCardProps) {
  const resolvedThumbSize = thumbSize ?? (orientation === 'horizontal' ? 'sm' : 'md');

  const leadContent = (
    <>
      <MediaThumb
        className="ui-media-card-thumb"
        src={coverImage}
        alt=""
        initials={initials}
        size={resolvedThumbSize}
      />
      <span className="ui-media-card-title">{title}</span>
    </>
  );

  let lead: ReactNode;
  if (titleHref) {
    lead = renderTitleLink ? (
      renderTitleLink({ href: titleHref, className: LEAD_LINK_CLASS, children: leadContent })
    ) : (
      <a className={LEAD_LINK_CLASS} href={titleHref}>
        {leadContent}
      </a>
    );
  } else {
    lead = <div className="ui-media-card-lead">{leadContent}</div>;
  }

  return (
    <div
      className={['ui-media-card', `ui-media-card--${orientation}`, className ?? '']
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {/* Footer is rendered next to the lead, never inside it, so its controls
          stay out of the anchor and remain independently clickable. */}
      {lead}
      {meta && <p className="ui-media-card-meta">{meta}</p>}
      {footer && <div className="ui-media-card-footer">{footer}</div>}
    </div>
  );
}
