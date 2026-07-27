import { useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import { decoratePromos } from '../utils/promos';
import { recordRedemption } from '../api/redemptionsApi';
import { ChevronLeftIcon, HeartIcon } from '../components/icons';

export default function DetailScreen() {
  const { state, goHome, toggleFav } = useApp();
  const coords = state.geoStatus === 'granted' ? state.coords : null;
  const [redeemed, setRedeemed] = useState(false);

  const promo = useMemo(() => {
    const decorated = decoratePromos(state.promos, { favorites: state.favorites, coords });
    return decorated.find((p) => p.id === state.selectedId) || decorated[0];
  }, [state.promos, state.favorites, coords, state.selectedId]);

  if (!promo) return null;

  const badgeLabel = promo.isBank ? 'BANCARIA' : promo.category.toUpperCase();

  const handleShowCode = () => {
    setRedeemed(true);
    recordRedemption(promo.id);
  };

  return (
    <div className="screen">
      <div className="detail-hero">
        {promo.imageUrl ? (
          <img src={promo.imageUrl} alt={promo.business} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className="detail-hero-label">{promo.imageLabel}</div>
        )}
        <button type="button" className="btn btn-icon btn-secondary detail-hero-btn" style={{ left: 16 }} onClick={goHome} aria-label="Volver">
          <ChevronLeftIcon size={16} strokeWidth="2.2" />
        </button>
        <button
          type="button"
          className="btn btn-icon btn-secondary detail-hero-btn"
          style={{ right: 16 }}
          onClick={(e) => toggleFav(promo.id, e)}
          aria-label="Guardar promoción"
        >
          <HeartIcon filled={promo.isFav} size={16} style={{ color: promo.isFav ? 'var(--color-accent)' : 'var(--color-text)' }} />
        </button>
      </div>

      <div className="screen-body screen-body--dark" style={{ paddingBottom: 100 }}>
        <div className={`tag tag-accent`} style={{ marginBottom: 10, alignSelf: 'flex-start' }}>
          {badgeLabel}
        </div>
        <div className="card-title-row">
          <h3 style={{ color: 'var(--color-dark-text)' }}>{promo.business}</h3>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--color-accent-400)', whiteSpace: 'nowrap' }}>
            {promo.discountLabel}
          </div>
        </div>
        <div className="text-muted" style={{ marginTop: 6, color: 'var(--color-dark-text-muted)' }}>
          {promo.category} · {promo.distance}
        </div>
        <hr className="hr" style={{ borderColor: 'var(--color-dark-divider)' }} />
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>{promo.description}</div>
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--color-dark-text-muted)' }}>Vigencia</span>
            <span style={{ fontWeight: 700 }}>Hasta {promo.expiry}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--color-dark-text-muted)' }}>Cómo usarla</span>
            <span style={{ fontWeight: 700 }}>{promo.redeemHint}</span>
          </div>
        </div>
        <div className="detail-code">
          <div className="detail-code-value" style={{ color: 'var(--color-text)' }}>
            {promo.code}
          </div>
        </div>
      </div>

      <div className="detail-footer">
        <button type="button" className="btn btn-primary btn-block" onClick={handleShowCode}>
          {redeemed ? '✓ Código mostrado' : 'Mostrar código en el local'}
        </button>
      </div>
    </div>
  );
}
