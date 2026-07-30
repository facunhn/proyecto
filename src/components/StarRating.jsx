import { StarIcon } from './icons';

export default function StarRating({ value, onChange, size = 16 }) {
  const stars = [1, 2, 3, 4, 5];
  const interactive = typeof onChange === 'function';

  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {stars.map((n) => (
        <button
          key={n}
          type={interactive ? 'button' : undefined}
          onClick={interactive ? () => onChange(n) : undefined}
          aria-label={`${n} estrellas`}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: interactive ? 'pointer' : 'default',
            color: n <= Math.round(value) ? '#f5a623' : 'var(--color-neutral-400)',
          }}
        >
          <StarIcon filled={n <= Math.round(value)} size={size} />
        </button>
      ))}
    </div>
  );
}
