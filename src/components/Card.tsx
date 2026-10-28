import type { CSSProperties, ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
}

export function Card({ children, padding = 'md', className, style }: CardProps) {
  return (
    <div
      className={['ui-card', `ui-card--pad-${padding}`, className ?? ''].filter(Boolean).join(' ')}
      style={style}
    >
      {children}
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
      <CardBody className={contentClassName}>{children}</CardBody>
    </Card>
  );
}
