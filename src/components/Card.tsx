import type { CSSProperties, ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Hover lift + press-in animation, pointer cursor and a focus ring when a focusable
   *  element lives inside. Opt-in: plain panel Cards never move. */
  interactive?: boolean;
  /** Accent border + inset accent ring. Independent of `interactive`. */
  selected?: boolean;
  /** Replaces the visible content with a shimmer skeleton while KEEPING the exact height
   *  of the real content (children stay in the DOM, `visibility: hidden`). Sets `aria-busy`. */
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** Custom properties are not part of `CSSProperties`, so the shimmer geometry rides on a cast. */
function skeletonBlockStyle(height: string, width?: string): CSSProperties {
  return {
    '--ui-card-skeleton-h': height,
    ...(width ? { '--ui-card-skeleton-w': width } : {}),
  } as CSSProperties;
}

export function Card({
  children,
  padding = 'md',
  interactive = false,
  selected = false,
  loading = false,
  className,
  style,
}: CardProps) {
  return (
    <div
      className={[
        'ui-card',
        `ui-card--pad-${padding}`,
        interactive ? 'ui-card--interactive' : '',
        selected ? 'ui-card--selected' : '',
        loading ? 'ui-card--loading' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      aria-busy={loading ? 'true' : undefined}
    >
      <div className="ui-card-content">{children}</div>
      {loading && (
        <div className="ui-card-skeleton" aria-hidden="true">
          <span className="ui-card-skeleton-block" style={skeletonBlockStyle('56%')} />
          <span className="ui-card-skeleton-block" style={skeletonBlockStyle('12px', '70%')} />
          <span className="ui-card-skeleton-block" style={skeletonBlockStyle('12px', '45%')} />
        </div>
      )}
    </div>
  );
}

export interface CardHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, actions, className }: CardHeaderProps) {
  return (
    <div className={['ui-card-header', className ?? ''].filter(Boolean).join(' ')}>
      <div>
        <div className="ui-card-title">{title}</div>
        {subtitle && <div className="ui-card-subtitle">{subtitle}</div>}
      </div>
      {actions && <div className="ui-card-actions">{actions}</div>}
    </div>
  );
}

export function CardBody({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={['ui-card-body', className ?? ''].filter(Boolean).join(' ')} style={style}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={['ui-card-footer', className ?? ''].filter(Boolean).join(' ')} style={style}>
      {children}
    </div>
  );
}

export interface SectionProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  style?: CSSProperties;
}

/** Card with a standard header and body — the Settings-style section pattern. */
export function Section({
  title,
  subtitle,
  actions,
  children,
  className,
  contentClassName,
  style,
}: SectionProps) {
  return (
    <Card padding="none" className={className} style={style}>
      <CardHeader title={title} subtitle={subtitle} actions={actions} />
      <CardBody className={contentClassName}>
        <div className="ui-section-stack">{children}</div>
      </CardBody>
    </Card>
  );
}
