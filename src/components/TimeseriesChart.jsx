export default function TimeseriesChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.redemptions_count));

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 70, marginTop: 6 }}>
      {data.map((d) => (
        <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div
            title={`${d.day}: ${d.redemptions_count} canjes`}
            style={{
              width: '100%',
              height: `${Math.max(3, (d.redemptions_count / max) * 54)}px`,
              background: 'var(--color-accent)',
              borderRadius: 2,
            }}
          />
        </div>
      ))}
    </div>
  );
}
