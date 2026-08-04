import { useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import { decoratePromos, sortPromos } from '../utils/promos';
import CategoryChips from '../components/CategoryChips';
import PromoListItem from '../components/PromoListItem';
import SkeletonListItem from '../components/SkeletonListItem';
import SortControl from '../components/SortControl';

export default function SearchScreen() {
  const { state, openDetail, setSearchQuery, setSearchCategory, toggleBankOnly } = useApp();
  const coords = state.geoStatus === 'granted' ? state.coords : null;
  const [sortBy, setSortBy] = useState('distancia');

  const searchResults = useMemo(() => {
    const decorated = decoratePromos(state.promos, { favorites: state.favorites, coords });
    const q = state.searchQuery.trim().toLowerCase();
    const filtered = decorated.filter((p) => {
      const matchesCat = state.searchCategory === 'Todos' || p.category === state.searchCategory;
      const matchesBank = !state.bankOnly || p.isBank;
      const matchesQuery =
        !q ||
        p.business.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchesCat && matchesBank && matchesQuery;
    });
    return sortPromos(filtered, sortBy);
  }, [state.promos, state.favorites, coords, state.searchQuery, state.searchCategory, state.bankOnly, sortBy]);

  return (
    <div className="screen">
      <div className="screen-header">
        <h4 style={{ marginBottom: 14 }}>Buscar</h4>
        <div className="field" style={{ marginBottom: 12 }}>
          <input
            className="input"
            aria-label="Buscar por comercio, rubro o banco"
            value={state.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Comercio, rubro o banco"
          />
        </div>
        <CategoryChips active={state.searchCategory} onSelect={setSearchCategory} />
        <label className="radio" style={{ marginTop: 12 }}>
          <input type="checkbox" checked={state.bankOnly} onChange={toggleBankOnly} className="sr-only" />
          <div className={`checkbox-box${state.bankOnly ? ' is-checked' : ''}`} />
          <div style={{ fontSize: 12.5, color: 'var(--color-dark-text)' }}>Solo promociones bancarias</div>
        </label>
      </div>

      <div className="screen-body screen-body--dark" style={{ gap: 0 }}>
        {state.promosLoading ? (
          [1, 2, 3].map((i) => <SkeletonListItem key={i} dark />)
        ) : (
          <>
            <div className="text-muted" style={{ fontSize: 12, marginBottom: 10, color: 'var(--color-dark-text-muted)' }}>
              {searchResults.length} resultados
            </div>
            <SortControl value={sortBy} onChange={setSortBy} />
            {searchResults.map((p) => (
              <PromoListItem key={p.id} promo={p} onOpen={openDetail} dark />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
