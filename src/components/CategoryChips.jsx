import { CATEGORIES } from '../api/mockData';

export default function CategoryChips({ active, onSelect }) {
  return (
    <div className="chip-row">
      {CATEGORIES.map((cat) => (
        <button key={cat} type="button" className={`chip${cat === active ? ' is-active' : ''}`} onClick={() => onSelect(cat)}>
          {cat}
        </button>
      ))}
    </div>
  );
}
