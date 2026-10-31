import { useState, type CSSProperties } from 'react';

export type MediaThumbSize = 'xs' | 'sm' | 'md';

export interface MediaThumbProps {
  src: string | null;
  alt?: string;
  initials: string;
  size?: MediaThumbSize;
  radius?: number | string;
  aspectRatio?: string;
  className?: string;
  style?: CSSProperties;
}

/** Inline style that also carries the two custom properties the CSS reads. */
type MediaThumbStyle = CSSProperties & {
  '--ui-media-thumb-radius'?: string;
  '--ui-media-thumb-ratio'?: string;
};

/**
 * Cover thumbnail with an initials fallback. A failed URL is remembered per
 * source, so a new `src` gets a fresh attempt instead of staying broken.
 */
export default function MediaThumb({
  src,
  alt,
  initials,
  size = 'md',
  radius,
  aspectRatio,
  className,
  style,
}: MediaThumbProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;

  const thumbStyle: MediaThumbStyle = { ...style };
  if (radius !== undefined) {
    thumbStyle['--ui-media-thumb-radius'] = typeof radius === 'number' ? `${radius}px` : radius;
  }
  if (aspectRatio) {
    thumbStyle['--ui-media-thumb-ratio'] = aspectRatio;
  }

  return (
    <div
      className={['ui-media-thumb', `ui-media-thumb--${size}`, className ?? '']
        .filter(Boolean)
        .join(' ')}
      style={thumbStyle}
    >
      {showImage && src ? (
        <img
          className="ui-media-thumb-img"
          src={src}
          alt={alt ?? ''}
          loading="lazy"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <div className="ui-media-thumb-fallback" aria-hidden="true">
          {initials}
        </div>
      )}
    </div>
  );
}
