import type { ReactNode } from 'react';
import Skeleton from './Skeleton';

export function SkeletonStatus({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" aria-label={label} className={className}>
      {children}
    </div>
  );
}

export function PageSkeleton({
  label,
  children,
  maxWidth = 700,
  padding = '28px 32px',
  className,
}: {
  label: string;
  children: ReactNode;
  maxWidth?: number;
  padding?: string;
  className?: string;
}) {
  return (
    <SkeletonStatus label={label}>
      <div
        style={{ height: '100%', overflowY: 'auto', padding }}
        className={`ui-scroll-y${className ? ` ${className}` : ''}`}
      >
        <div style={{ maxWidth, margin: '0 auto' }}>{children}</div>
      </div>
    </SkeletonStatus>
  );
}

export function PageHeaderSkeleton({
  actionWidth = 120,
  marginBottom = 24,
}: {
  actionWidth?: number | null;
  marginBottom?: number;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom,
      }}
    >
      <div>
        <Skeleton width={190} height={22} radius={7} />
        <div style={{ marginTop: 8 }}>
          <Skeleton width={300} height={12} />
        </div>
      </div>
      {actionWidth !== null && <Skeleton width={actionWidth} height={36} radius={8} />}
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div style={{ marginBottom: 16 }}>
      <Skeleton height={38} radius={8} />
    </div>
  );
}

export function ListCardSkeleton({
  rows = 5,
  leading = 'dot',
  trailing = 'actions',
}: {
  rows?: number;
  leading?: 'dot' | 'avatar' | 'none';
  trailing?: 'actions' | 'amount' | 'none';
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        background: 'var(--ui-surface)',
        border: '1px solid var(--ui-border)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '13px 20px',
            borderTop: index === 0 ? 'none' : '1px solid var(--ui-border)',
          }}
        >
          {leading === 'dot' && <Skeleton width={12} height={12} circle />}
          {leading === 'avatar' && <Skeleton width={44} height={28} radius={5} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Skeleton width={`${55 - (index % 3) * 8}%`} height={14} />
            <div style={{ marginTop: 6 }}>
              <Skeleton width={`${34 - (index % 2) * 6}%`} height={11} />
            </div>
          </div>
          {trailing === 'amount' && <Skeleton width={78} height={14} />}
          {trailing === 'actions' && (
            <div style={{ display: 'flex', gap: 6 }}>
              <Skeleton width={24} height={24} radius={6} />
              <Skeleton width={24} height={24} radius={6} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function DetailRowsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          style={{
            display: 'grid',
            gridTemplateColumns: '76px 1fr 84px',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <Skeleton width={60} height={11} />
          <Skeleton width={`${72 - index * 9}%`} height={12} />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Skeleton width={58} height={12} />
          </div>
        </div>
      ))}
    </div>
  );
}
