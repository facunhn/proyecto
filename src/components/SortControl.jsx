const OPTIONS = [
  { value: 'distancia', label: 'Distancia' },
  { value: 'descuento', label: 'Descuento' },
  { value: 'vencimiento', label: 'Vencimiento' },
];

export default function SortControl({ value, onChange }) {
  return (
    <div className="seg" style={{ marginBottom: 10 }}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`seg-opt${value === opt.value ? ' is-active' : ''}`}
          onClick={() => onChange(opt.value)}
          style={{ padding: '7px 10px', fontSize: 11.5 }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
