import { useMemo } from 'react';
import { useApp } from '../state/AppContext';
import { decoratePromos } from '../utils/promos';
import PromoListItem from '../components/PromoListItem';
import SkeletonListItem from '../components/SkeletonListItem';

export default function FavoritesScreen() {
  const { state, openDetail } = useApp();
  const coords = state.geoStatus === 'granted' ? state.coords : null;

  const favoritePromos = useMemo(() => {
    const decorated = decoratePromos(state.promos, { favorites: state.favorites, coords });
    return decorated.filter((p) => state.favorites.includes(p.id));
  }, [state.promos, state.favorites, coords]);

  const favCountLabel =
    favoritePromos.length === 0
      ? 'Sin promociones guardadas'
      : `${favoritePromos.length} promoción${favoritePromos.length === 1 ? '' : 'es'} guardada${favoritePromos.length === 1 ? '' : 's'}`;

  return (
    <div className="screen">
      <div className="screen-header">
        <h4 style={{ marginBottom: 4 }}>Favoritos</h4>
        <div className="text-muted">{favCountLabel}</div>
      </div>

      <div className="screen-body screen-body--dark">
        {state.promosLoading && [1, 2, 3].map((i) => <SkeletonListItem key={i} dark />)}
        {!state.promosLoading &&
          favoritePromos.map((p) => <PromoListItem key={p.id} promo={p} onOpen={openDetail} expiryPrefix="Vence" dark />)}
        {!state.promosLoading && favoritePromos.length === 0 && (
          <div className="empty-state empty-state--dark" style={{ padding: '60px 20px' }}>
            Todavía no guardaste ninguna promoción.
            <br />
            <br />
            Tocá el ícono de guardar en una promo para verla acá.
          </div>
        )}
      </div>
    </div>
  );
}
