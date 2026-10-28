import type { CSSProperties, ReactNode } from 'react';

export interface EmptyStateProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  style,
}: EmptyStateProps) {
  return (
    <div className={['ui-empty-state', className ?? ''].filter(Boolean).join(' ')} style={style}>
      {icon && (
        <div className="ui-empty-state-icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <div className="ui-empty-state-title">{title}</div>
      {description && <div className="ui-empty-state-description">{description}</div>}
      {action && <div className="ui-empty-state-action">{action}</div>}
    </div>
  );
}
