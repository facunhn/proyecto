import { useMemo } from 'react';
import { useApp } from '../state/AppContext';
import { decoratePromos } from '../utils/promos';
import { accountInitials } from '../utils/account';
import Logo from '../components/Logo';
import CategoryChips from '../components/CategoryChips';
import PromoCard from '../components/PromoCard';
import { BellIcon, PinIcon } from '../components/icons';

const GEO_LABELS = {
  granted: 'Ubicación activada · ordenado por cercanía',
  loading: 'Buscando tu ubicación…',
  denied: 'Sin acceso a ubicación · tocá para reintentar',
  idle: 'Activar ubicación para ver lo más cercano',
};

export default function HomeScreen() {
  const { state, openDetail, toggleFav, requestLocation, toggleAccount, setHomeCategory, retryLoadPromos } = useApp();
  const coords = state.geoStatus === 'granted' ? state.coords : null;

  const feedPromos = useMemo(() => {
    const decorated = decoratePromos(state.promos, { favorites: state.favorites, coords });
    return decorated.filter((p) => state.homeCategory === 'Todos' || p.category === state.homeCategory);
  }, [state.promos, state.favorites, coords, state.homeCategory]);

  return (
    <div className="screen">
      <div className="screen-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Logo />
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 20 }}>
            <div style={{ position: 'relative', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 100 }}>
              <BellIcon size={17} style={{ color: '#fff' }} />
              <div style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: '50%', background: 'var(--color-accent-400)' }} />
            </div>
            <button type="button" className="avatar-chip" style={{ border: '1px solid rgba(255,255,255,0.4)', cursor: 'pointer' }} onClick={toggleAccount}>
              {accountInitials(state.session, state.accountType)}
            </button>
          </div>
        </div>
        <button type="button" className="geo-row" onClick={requestLocation}>
          <PinIcon size={15} style={{ color: state.geoStatus === 'granted' ? 'var(--color-accent-400)' : 'rgba(255,255,255,0.7)' }} />
          <div className="geo-label" style={{ color: state.geoStatus === 'granted' ? 'var(--color-accent-300)' : 'rgba(255,255,255,0.85)' }}>
            {GEO_LABELS[state.geoStatus]}
          </div>
        </button>
        <CategoryChips active={state.homeCategory} onSelect={setHomeCategory} />
      </div>

      <div className="screen-body screen-body--dark">
        {state.promosLoading && <div className="empty-state empty-state--dark">Buscando promociones…</div>}

        {!state.promosLoading && state.promosError && (
          <div className="empty-state empty-state--dark">
            No pudimos cargar las promociones.
            <br />
            <br />
            <button type="button" className="btn btn-primary" onClick={retryLoadPromos}>
              Reintentar
            </button>
          </div>
        )}

        {!state.promosLoading &&
          !state.promosError &&
          feedPromos.map((p) => <PromoCard key={p.id} promo={p} onOpen={openDetail} onToggleFav={toggleFav} />)}

        {!state.promosLoading && !state.promosError && feedPromos.length === 0 && (
          <div className="empty-state empty-state--dark">No hay promociones en esta categoría.</div>
        )}
      </div>
    </div>
  );
}
