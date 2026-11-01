import type { CSSProperties, ReactNode } from 'react';
import MediaThumb, { type MediaThumbSize } from './MediaThumb';
import { Card } from './Card';

export type ItemSize = 'sm' | 'md' | 'lg';
export type ItemMediaPosition = 'start' | 'top';
/**
 * `surface` (default) is the padded card. `poster` drops the card chrome: the
 * cover leads the cell at the poster ratio, the text sits under it, and the
 * cover zooms while a scrim rises on hover — the gallery card.
 */
export type ItemVariant = 'surface' | 'poster';

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
  /** Omitted means `surface`. `poster` always puts the cover above the text. */
  variant?: ItemVariant;
  /**
   * Presentational chip pinned to the cover's top-right corner (poster only).
   * It lives inside the title anchor, so it must not hold a control: pass an
   * icon, a label or a `Badge`, never a button.
   */
  badge?: ReactNode;
  /**
   * The one real control that belongs on the cover's top-right corner (poster
   * only): a monitor toggle, a menu trigger, a favourite. Rendered as a sibling
   * of the lead, never inside the anchor, so it stays focusable and clickable.
   */
  coverAction?: ReactNode;
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
  variant = 'surface',
  badge,
  coverAction,
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
  // A poster always leads with its cover, whatever position the caller asked
  // for: the shape is the cover above the text, with the chip on the corner.
  const poster = variant === 'poster';
  const position: ItemMediaPosition = poster ? 'top' : mediaPosition;
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
          // A cover above the text spans the whole body, so it always takes the
          // poster scale: the size class still drives the initials' font size
          // (and only that, since the CSS pins its width to 100%).
          size={media.size ?? (position === 'top' ? 'md' : THUMB_SIZE[size])}
          aspectRatio={media.aspectRatio ?? (position === 'top' ? '2 / 3' : undefined)}
          fallback={thumbFallback}
        />
      )}
      {/* Sits after the cover so it paints over it; presentational only, since
          the lead is the anchor. */}
      {poster && badge != null && <span className="ui-item-badge">{badge}</span>}
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
    <Card
      padding="none"
      interactive={interactive}
      selected={selected}
      loading={loading}
      className={[
        'ui-item',
        `ui-item--${size}`,
        `ui-item--${position}`,
        `ui-item--${variant}`,
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <div className="ui-item-body">
        {lead}
        {poster && coverAction != null && <div className="ui-item-cover-action">{coverAction}</div>}
        {/* Sibling of the lead: controls inside an <a> would be unreachable. */}
        {actions && <div className="ui-item-actions">{actions}</div>}
      </div>
      {footer && <div className="ui-item-footer">{footer}</div>}
    </Card>
  );
}
