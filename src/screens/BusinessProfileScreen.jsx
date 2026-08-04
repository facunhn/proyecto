import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import { decoratePromos } from '../utils/promos';
import { fetchBusinessReviews, fetchMyReviewFor, submitBusinessReview } from '../api/businessReviewsApi';
import { fetchMyFollowedBusinessIds, followBusiness, unfollowBusiness } from '../api/followsApi';
import PromoListItem from '../components/PromoListItem';
import StarRating from '../components/StarRating';
import ReportButton from '../components/ReportButton';
import { ChevronLeftIcon } from '../components/icons';

export default function BusinessProfileScreen() {
  const { state, goHome, openDetail, requireAuth } = useApp();
  const businessId = state.selectedBusinessId;
  const coords = state.geoStatus === 'granted' ? state.coords : null;

  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  const businessPromos = useMemo(() => {
    const decorated = decoratePromos(state.promos, { favorites: state.favorites, coords });
    return decorated.filter((p) => p.ownerId === businessId);
  }, [state.promos, state.favorites, coords, businessId]);

  const businessName = businessPromos[0]?.business || 'Comercio';
  const businessHours = businessPromos.find((p) => p.businessHours)?.businessHours;

  const load = () => {
    setLoading(true);
    Promise.all([fetchBusinessReviews(businessId), fetchMyReviewFor(businessId)])
      .then(([{ reviews: r, average: avg }, mine]) => {
        setReviews(r);
        setAverage(avg);
        if (mine) {
          setMyRating(mine.rating);
          setMyComment(mine.comment || '');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (businessId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  useEffect(() => {
    if (!state.session) return;
    fetchMyFollowedBusinessIds()
      .then((ids) => setFollowing(ids.includes(businessId)))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, state.session]);

  const handleToggleFollow = async () => {
    if (!requireAuth() || followBusy) return;
    setFollowBusy(true);
    try {
      if (following) {
        await unfollowBusiness(businessId);
        setFollowing(false);
      } else {
        await followBusiness(businessId);
        setFollowing(true);
      }
    } finally {
      setFollowBusy(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!myRating) return;
    if (!requireAuth()) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await submitBusinessReview(businessId, myRating, myComment.trim());
      setSaved(true);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!businessId) return null;

  return (
    <div className="screen">
      <div className="screen-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" className="btn btn-icon btn-secondary" onClick={goHome} aria-label="Volver">
          <ChevronLeftIcon size={16} strokeWidth="2.2" />
        </button>
        <div style={{ flex: 1 }}>
          <h4 style={{ marginBottom: 4 }}>{businessName}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StarRating value={average} />
            <span className="text-muted" style={{ fontSize: 12 }}>
              {average ? average.toFixed(1) : 'Sin reseñas'} {reviews.length > 0 && `(${reviews.length})`}
            </span>
          </div>
        </div>
        <button
          type="button"
          className={following ? 'btn btn-secondary' : 'btn'}
          style={{ fontSize: 12.5, padding: '8px 14px', whiteSpace: 'nowrap' }}
          disabled={followBusy}
          onClick={handleToggleFollow}
        >
          {following ? 'Siguiendo ✓' : 'Seguir'}
        </button>
      </div>

      <div className="screen-body screen-body--dark">
        {businessHours && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 14 }}>
            <span style={{ color: 'var(--color-dark-text-muted)' }}>Horario</span>
            <span style={{ fontWeight: 700 }}>{businessHours}</span>
          </div>
        )}

        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Dejar una reseña</div>
        <StarRating value={myRating} onChange={setMyRating} size={22} />
        <textarea
          className="input"
          value={myComment}
          onChange={(e) => setMyComment(e.target.value)}
          placeholder="Comentario (opcional)"
          style={{ marginTop: 10 }}
        />
        {error && <div style={{ color: '#ff9d9d', fontSize: 12, marginTop: 6 }}>{error}</div>}
        {saved && <div style={{ color: 'var(--color-accent-400)', fontSize: 12, marginTop: 6, fontWeight: 700 }}>¡Gracias por tu reseña!</div>}
        <button type="button" className="btn btn-block" style={{ marginTop: 10 }} disabled={!myRating || saving} onClick={handleSubmitReview}>
          {saving ? 'Guardando…' : 'Enviar reseña'}
        </button>

        <hr className="hr" />
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
          Reseñas {reviews.length > 0 && `(${reviews.length})`}
        </div>
        {loading && <div className="text-muted">Cargando…</div>}
        {!loading && reviews.length === 0 && <div className="empty-state empty-state--dark">Todavía no tiene reseñas.</div>}
        {!loading &&
          reviews.map((r) => (
            <div key={r.id} className="published-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
              <StarRating value={r.rating} size={13} />
              {r.comment && <div style={{ fontSize: 13 }}>{r.comment}</div>}
              <div>
                <ReportButton targetType="review" targetId={r.id} label="Reportar reseña" />
              </div>
            </div>
          ))}

        <hr className="hr" />
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Promociones activas</div>
        {businessPromos.length === 0 && <div className="empty-state empty-state--dark">No tiene promociones activas.</div>}
        {businessPromos.map((p) => (
          <PromoListItem key={p.id} promo={p} onOpen={openDetail} dark />
        ))}
      </div>
    </div>
  );
}
