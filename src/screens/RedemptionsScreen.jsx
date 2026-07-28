import { useEffect, useState } from 'react';
import { useApp } from '../state/AppContext';
import { fetchRedemptions } from '../api/redemptionsApi';
import { ChevronLeftIcon } from '../components/icons';
import SkeletonListItem from '../components/SkeletonListItem';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function RedemptionsScreen() {
  const { goTo } = useApp();
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRedemptions()
      .then(setRedemptions)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="screen">
      <div className="screen-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" className="btn btn-icon btn-secondary" onClick={() => goTo('profile')} aria-label="Volver">
          <ChevronLeftIcon size={16} strokeWidth="2.2" />
        </button>
        <div>
          <h4 style={{ marginBottom: 4 }}>Historial de canjes</h4>
          <div className="text-muted">Promociones que ya mostraste en un local</div>
        </div>
      </div>

      <div className="screen-body screen-body--dark">
        {loading && [1, 2, 3].map((i) => <SkeletonListItem key={i} dark />)}
        {!loading &&
          redemptions.map((r) => (
            <div key={r.id} className="published-row">
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{r.business}</div>
                <div className="text-muted" style={{ fontSize: 11.5, marginTop: 2 }}>
                  {r.category} · {r.discountLabel}
                </div>
              </div>
              <div className="text-muted" style={{ fontSize: 11.5 }}>
                {formatDate(r.redeemedAt)}
              </div>
            </div>
          ))}
        {!loading && redemptions.length === 0 && (
          <div className="empty-state empty-state--dark" style={{ padding: '60px 20px' }}>
            Todavía no canjeaste ninguna promoción.
            <br />
            <br />
            Cuando toques "Mostrar código en el local" en una promo, va a quedar registrada acá.
          </div>
        )}
      </div>
    </div>
  );
}
