import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../state/AppContext';
import { decoratePromos } from '../utils/promos';
import { recordRedemption } from '../api/redemptionsApi';
import { ChevronLeftIcon, HeartIcon, ShareIcon, CloseIcon } from '../components/icons';

export default function DetailScreen() {
  const { state, goHome, toggleFav, openBusiness } = useApp();
  const coords = state.geoStatus === 'granted' ? state.coords : null;
  const [redeemed, setRedeemed] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [redeemError, setRedeemError] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  const promo = useMemo(() => {
    const decorated = decoratePromos(state.promos, { favorites: state.favorites, coords });
    return decorated.find((p) => p.id === state.selectedId) || decorated[0];
  }, [state.promos, state.favorites, coords, state.selectedId]);

  useEffect(() => {
    if (!promo?.code) {
      setQrDataUrl(null);
      return;
    }
    const redeemUrl = `${window.location.origin}${window.location.pathname}?redeem=${encodeURIComponent(promo.code)}`;
    QRCode.toDataURL(redeemUrl, { margin: 1, width: 260 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [promo?.code]);

  if (!promo) return null;

  const badgeLabel = promo.isBank ? 'BANCARIA' : promo.category.toUpperCase();

  const handleShowCode = async () => {
    setRedeemError(null);
    try {
      await recordRedemption(promo.id);
      setRedeemed(true);
      setShowQrModal(true);
    } catch (error) {
      setRedeemError(error.message);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: promo.business,
      text: `${promo.business}: ${promo.discountLabel} — ${promo.description}`,
      url: window.location.origin,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // el usuario canceló el share, no hacemos nada
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      alert('Copiado al portapapeles');
    }
  };

  return (
    <div className="screen">
      <div className="detail-hero">
        {promo.photoUrls?.length ? (
          <>
            <img
              src={promo.photoUrls[photoIndex]}
              alt={promo.business}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {promo.photoUrls.length > 1 && (
              <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
                {promo.photoUrls.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPhotoIndex(i)}
                    aria-label={`Foto ${i + 1}`}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      border: 'none',
                      padding: 0,
                      background: i === photoIndex ? '#ffffff' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="detail-hero-label">{promo.imageLabel}</div>
        )}
        <button type="button" className="btn btn-icon btn-secondary detail-hero-btn" style={{ left: 16 }} onClick={goHome} aria-label="Volver">
          <ChevronLeftIcon size={16} strokeWidth="2.2" />
        </button>
        <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button type="button" className="btn btn-icon btn-secondary" onClick={(e) => toggleFav(promo.id, e)} aria-label="Guardar promoción">
            <HeartIcon filled={promo.isFav} size={16} style={{ color: promo.isFav ? 'var(--color-accent)' : 'var(--color-text)' }} />
          </button>
          <button type="button" className="btn btn-icon btn-secondary" onClick={handleShare} aria-label="Compartir promoción">
            <ShareIcon size={16} />
          </button>
        </div>
      </div>

      <div className="screen-body screen-body--dark" style={{ paddingBottom: 100 }}>
        <div className={`tag tag-accent`} style={{ marginBottom: 10, alignSelf: 'flex-start' }}>
          {badgeLabel}
        </div>
        <div className="card-title-row">
          {promo.ownerId ? (
            <button
              type="button"
              onClick={() => openBusiness(promo.ownerId)}
              style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}
            >
              <h3 style={{ color: 'var(--color-dark-text)', textDecoration: 'underline' }}>{promo.business}</h3>
            </button>
          ) : (
            <h3 style={{ color: 'var(--color-dark-text)' }}>{promo.business}</h3>
          )}
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
          {promo.redemptionLimit && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--color-dark-text-muted)' }}>Límite de canjes</span>
              <span style={{ fontWeight: 700 }}>{promo.redemptionLimit} por persona</span>
            </div>
          )}
          {promo.businessHours && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--color-dark-text-muted)' }}>Horario</span>
              <span style={{ fontWeight: 700 }}>{promo.businessHours}</span>
            </div>
          )}
        </div>
        <div className="detail-code">
          <div className="detail-code-value" style={{ color: 'var(--color-text)' }}>
            {promo.code}
          </div>
        </div>
      </div>

      <div className="detail-footer">
        {redeemError && (
          <div style={{ color: '#ff9d9d', fontSize: 12, marginBottom: 8, textAlign: 'center' }}>{redeemError}</div>
        )}
        <button type="button" className="btn btn-primary btn-block" onClick={handleShowCode}>
          {redeemed ? '✓ Código mostrado' : 'Mostrar código en el local'}
        </button>
      </div>

      {showQrModal && (
        <div className="qr-modal-overlay" onClick={() => setShowQrModal(false)}>
          <button
            type="button"
            className="btn btn-icon qr-modal-close"
            onClick={() => setShowQrModal(false)}
            aria-label="Cerrar"
          >
            <CloseIcon size={18} strokeWidth="2.2" style={{ color: '#1a1330' }} />
          </button>
          <div className="qr-modal-card" onClick={(e) => e.stopPropagation()}>
            {qrDataUrl && <img src={qrDataUrl} alt={`Código QR para ${promo.code}`} width={220} height={220} />}
            <div className="detail-code-value" style={{ color: '#1a1330', marginTop: 14 }}>
              {promo.code}
            </div>
            <div className="text-muted" style={{ marginTop: 6, textAlign: 'center' }}>
              Mostrale esto al local para canjear tu promoción
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
