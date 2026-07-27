export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton--dark" style={{ height: 120, marginBottom: 12 }} />
      <div className="skeleton skeleton--dark" style={{ height: 16, width: '60%', marginBottom: 8 }} />
      <div className="skeleton skeleton--dark" style={{ height: 12, width: '90%', marginBottom: 6 }} />
      <div className="skeleton skeleton--dark" style={{ height: 12, width: '40%' }} />
    </div>
  );
}
