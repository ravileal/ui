import type { CSSProperties, ReactElement, ReactNode } from 'react';
import MediaThumb, { type MediaThumbSize } from './MediaThumb';
import { Card, type CardProps } from './Card';

export type ItemSize = 'sm' | 'md' | 'lg';
export type ItemMediaPosition = 'start' | 'top';

export interface ItemMedia {
  src?: string | null;
  initials?: string;
  /** 'initials' (default) reserves the box; 'none' means "text only, no image slot". */
  fallback?: 'initials' | 'none';
  size?: MediaThumbSize;
  aspectRatio?: string;
  alt?: string;
}

export interface ItemLinkRenderProps {
  href: string;
  className: string;
  children: ReactNode;
}

export interface ItemProps {
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  /** Optional media. Omitted ⇒ the text occupies the whole row. */
  media?: ItemMedia | null;
  /** 'start' = thumbnail beside the text (list row); 'top' = cover above the text (grid cell). */
  mediaPosition?: ItemMediaPosition;
  size?: ItemSize;
  href?: string;
  /** Router-agnostic escape hatch for the title/media link. */
  renderLink?: (props: ItemLinkRenderProps) => ReactNode;
  /** Trailing controls — always a sibling of the link, never inside the anchor. */
  actions?: ReactNode;
  footer?: ReactNode;
  interactive?: boolean;
  selected?: boolean;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Card gains `interactive`, `selected` and `loading` in the 0.5.0 contract,
 * which lands from a parallel stream. The narrowed type keeps this branch
 * compiling before that merge; the props are additive, so the cast stays
 * valid once the base component ships them.
 */
type ItemCardProps = CardProps & {
  interactive?: boolean;
  selected?: boolean;
  loading?: boolean;
};
const ItemCard = Card as (props: ItemCardProps) => ReactElement;

const LEAD_CLASS = 'ui-item-lead';
const LEAD_LINK_CLASS = 'ui-item-lead is-link';

const THUMB_SIZE: Record<ItemSize, MediaThumbSize> = { sm: 'xs', md: 'sm', lg: 'md' };

/**
 * The card as a list/grid item: optional media (beside or above the text), a
 * title, subtitle and meta line, plus trailing actions and a footer. The card
 * owns surface, border, radius and the interactive/loading/selected states;
 * this component only lays the row out.
 */
export default function Item({
  title,
  subtitle,
  meta,
  media,
  mediaPosition = 'start',
  size = 'md',
  href,
  renderLink,
  actions,
  footer,
  interactive,
  selected,
  loading,
  className,
  style,
}: ItemProps) {
  const thumbFallback = media?.fallback ?? 'initials';
  // A missing image with `fallback="none"` is "no image slot": do not render a
  // thumb at all. Any other combination keeps the initials box (or the image).
  const showThumb = Boolean(media) && (Boolean(media?.src) || thumbFallback !== 'none');

  const leadContent = (
    <>
      {showThumb && media && (
        <MediaThumb
          className="ui-item-thumb"
          src={media.src ?? null}
          alt={media.alt ?? ''}
          initials={media.initials ?? ''}
          size={media.size ?? THUMB_SIZE[size]}
          aspectRatio={media.aspectRatio ?? (mediaPosition === 'top' ? '2 / 3' : undefined)}
          fallback={thumbFallback}
        />
      )}
      <span className="ui-item-text">
        <span className="ui-item-title">{title}</span>
        {subtitle && <span className="ui-item-subtitle">{subtitle}</span>}
        {meta && <span className="ui-item-meta">{meta}</span>}
      </span>
    </>
  );

  let lead: ReactNode;
  if (href) {
    lead = renderLink ? (
      renderLink({ href, className: LEAD_LINK_CLASS, children: leadContent })
    ) : (
      <a className={LEAD_LINK_CLASS} href={href}>
        {leadContent}
      </a>
    );
  } else {
    lead = <div className={LEAD_CLASS}>{leadContent}</div>;
  }

  return (
    <ItemCard
      padding="none"
      interactive={interactive}
      selected={selected}
      loading={loading}
      className={['ui-item', `ui-item--${size}`, `ui-item--${mediaPosition}`, className ?? '']
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <div className="ui-item-body">
        {lead}
        {/* Sibling of the lead: controls inside an <a> would be unreachable. */}
        {actions && <div className="ui-item-actions">{actions}</div>}
      </div>
      {footer && <div className="ui-item-footer">{footer}</div>}
    </ItemCard>
  );
}
