import type { CSSProperties, ReactNode } from 'react';
import { Card } from './Card';
import MediaThumb, { type MediaThumbFallback, type MediaThumbSize } from './MediaThumb';

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
  /** 'initials' (default) reserves the cover box; 'none' means text only, no cover slot. */
  fallback?: MediaThumbFallback;
  /** Hover lift and press-in, forwarded to the card base. */
  interactive?: boolean;
  /** Accent border and inset ring, forwarded to the card base. */
  selected?: boolean;
  /** Skeleton at the real height, forwarded to the card base. */
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

const LEAD_LINK_CLASS = 'ui-media-card-lead is-link';

/**
 * Cover + title card with an optional metadata line and footer. The card can be
 * a link, but the footer stays a sibling of that link: interactive controls
 * (a Switch, a button) must never be nested inside an anchor.
 *
 * The root is the kit's `Card`, so surface, border, radius and the
 * interactive/selected/loading states all come from the base component; this
 * component only lays out the cover, title, meta line and footer.
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
  fallback = 'initials',
  interactive,
  selected,
  loading,
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
        fallback={fallback}
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
    <Card
      padding="none"
      interactive={interactive}
      selected={selected}
      loading={loading}
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
    </Card>
  );
}
