import type { CSSProperties, ReactNode } from 'react';

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  className?: string;
  style?: CSSProperties;
}

export default function PageHeader({
  title,
  subtitle,
  actions,
  onBack,
  backLabel = 'Back',
  className,
  style,
}: PageHeaderProps) {
  return (
    <div className={['ui-page-header', className ?? ''].filter(Boolean).join(' ')} style={style}>
      <div className="ui-page-header-main">
        {onBack && (
          <button
            type="button"
            className="ui-page-header-back"
            aria-label={backLabel}
            onClick={onBack}
          >
            ‹
          </button>
        )}
        <div>
          <h1 className="ui-page-header-title">{title}</h1>
          {subtitle && <p className="ui-page-header-subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="ui-page-header-actions">{actions}</div>}
    </div>
  );
}
