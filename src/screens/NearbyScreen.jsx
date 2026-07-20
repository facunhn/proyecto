import { useMemo } from 'react';
import { useApp } from '../state/AppContext';
import { decoratePromos } from '../utils/promos';
import PromoListItem from '../components/PromoListItem';

export default function NearbyScreen() {
  const { state, openDetail, requestLocation } = useApp();
  const coords = state.geoStatus === 'granted' ? state.coords : null;

  const nearby = useMemo(() => {
    const decorated = decoratePromos(state.promos, { favorites: state.favorites, coords });
    return decorated.filter((p) => !p.isBank).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [state.promos, state.favorites, coords]);

  const pins = nearby.slice(0, 5).map((p, i) => {
    const angle = (i / 5) * Math.PI * 2;
    const r = 30 + i * 8;
    const top = 50 + Math.sin(angle) * ((r / 190) * 100);
    const left = 50 + Math.cos(angle) * ((r / 480) * 100);
    return { ...p, top, left };
  });

  const mapCtaLabel = state.geoStatus === 'loading' ? 'Buscando tu ubicación…' : state.geoStatus === 'denied' ? 'Reintentar ubicación' : 'Activar geolocalizador';

  return (
    <div className="screen">
      <div className="screen-header screen-header--plain">
        <h4 style={{ marginBottom: 4, color: 'var(--color-text)' }}>Lugares cercanos</h4>
        <div className="text-muted">Geolocalizador de promociones a tu alrededor</div>
      </div>

      <div className="map-frame">
        <div className="map-grid" />
        <div className="map-you" />
        {pins.map((p) => (
          <button
            key={p.id}
            type="button"
            className="map-pin"
            style={{ top: `${p.top}%`, left: `${p.left}%` }}
            onClick={() => openDetail(p.id)}
            aria-label={p.business}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--color-accent)" stroke="var(--color-bg)" strokeWidth="1.5">
              <path d="M12 21s7-7.5 7-12a7 7 0 10-14 0c0 4.5 7 12 7 12z" />
            </svg>
          </button>
        ))}
        {state.geoStatus !== 'granted' && (
          <div className="map-overlay">
            <button type="button" className="btn btn-primary" onClick={requestLocation}>
              {mapCtaLabel}
            </button>
          </div>
        )}
      </div>

      <div className="screen-body">
        <div className="text-muted" style={{ marginBottom: 10 }}>
          {state.geoStatus === 'granted' ? 'Ordenado por distancia real a tu ubicación' : 'Activá el geolocalizador para ver distancias reales'}
        </div>
        {nearby.slice(0, 6).map((p) => (
          <PromoListItem key={p.id} promo={p} onOpen={openDetail} />
        ))}
      </div>
    </div>
  );
}
