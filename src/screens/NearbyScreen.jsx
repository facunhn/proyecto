import { useCallback, useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import { decoratePromos, sortPromos } from '../utils/promos';
import PromoListItem from '../components/PromoListItem';
import SkeletonListItem from '../components/SkeletonListItem';
import SortControl from '../components/SortControl';
import PromoMap from '../components/PromoMap';

export default function NearbyScreen() {
  const { state, openDetail, requestLocation } = useApp();
  const coords = state.geoStatus === 'granted' ? state.coords : null;
  const [sortBy, setSortBy] = useState('distancia');

  const nearby = useMemo(() => {
    const decorated = decoratePromos(state.promos, { favorites: state.favorites, coords });
    return sortPromos(
      decorated.filter((p) => !p.isBank),
      sortBy,
    );
  }, [state.promos, state.favorites, coords, sortBy]);

  const handleOpen = useCallback((id) => openDetail(id), [openDetail]);

  const mapCtaLabel = state.geoStatus === 'loading' ? 'Buscando tu ubicación…' : state.geoStatus === 'denied' ? 'Reintentar ubicación' : 'Activar geolocalizador';

  return (
    <div className="screen">
      <div className="screen-header">
        <h4 style={{ marginBottom: 4 }}>Lugares cercanos</h4>
        <div className="text-muted">Geolocalizador de promociones a tu alrededor</div>
      </div>

      <div className="map-frame">
        <PromoMap promos={nearby} coords={coords} onOpen={handleOpen} />
        {state.geoStatus !== 'granted' && (
          <div className="map-overlay">
            <button type="button" className="btn btn-primary" onClick={requestLocation}>
              {mapCtaLabel}
            </button>
          </div>
        )}
      </div>

      <div className="screen-body screen-body--dark">
        {state.promosLoading ? (
          [1, 2, 3].map((i) => <SkeletonListItem key={i} dark />)
        ) : (
          <>
            <div className="text-muted" style={{ marginBottom: 10 }}>
              {state.geoStatus === 'granted' ? 'Ordenado por distancia real a tu ubicación' : 'Activá el geolocalizador para ver distancias reales'}
            </div>
            <SortControl value={sortBy} onChange={setSortBy} />
            {nearby.slice(0, 6).map((p) => (
              <PromoListItem key={p.id} promo={p} onOpen={openDetail} dark />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
