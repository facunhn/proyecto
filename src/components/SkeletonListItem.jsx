export default function SkeletonListItem({ dark }) {
  const cls = dark ? 'skeleton skeleton--dark' : 'skeleton';
  return (
    <div className="skeleton-list-item" style={dark ? { borderBottomColor: 'var(--color-dark-divider)' } : undefined}>
      <div className={cls} style={{ width: 56, height: 56, flex: 'none' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
        <div className={cls} style={{ height: 14, width: '70%' }} />
        <div className={cls} style={{ height: 11, width: '45%' }} />
      </div>
    </div>
  );
}
