import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state/AppContext';
import { fetchMyPromos, fetchMyPromoStats, fetchMyPromoTimeseries, updatePromo, deletePromo } from '../api/promosApi';
import { compressImage } from '../utils/image';
import { isPastDate, isFutureDate } from '../utils/date';
import SkeletonListItem from '../components/SkeletonListItem';
import TimeseriesChart from '../components/TimeseriesChart';

const CATEGORY_OPTIONS = [
  { value: 'Gastronomía', label: 'Gastronomía' },
  { value: 'Indumentaria', label: 'Indumentaria' },
  { value: 'Electrodomésticos', label: 'Electrodomésticos' },
  { value: 'Supermercados', label: 'Supermercados' },
  { value: 'Farmacias', label: 'Farmacias' },
  { value: 'Bancos', label: 'Promoción bancaria' },
];

const EMPTY_DRAFT = {
  businessName: '',
  category: 'Gastronomía',
  discountLabel: '',
  expiry: '',
  startsAt: '',
  redemptionLimit: '',
  businessHours: '',
  description: '',
};
const MAX_PHOTOS = 4;

export default function PublishScreen() {
  const { state, setDraftField, submitDraft } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [existingPhotoUrls, setExistingPhotoUrls] = useState([]);
  const [myPromos, setMyPromos] = useState([]);
  const [stats, setStats] = useState({});
  const [timeseries, setTimeseries] = useState([]);
  const [loadingMyPromos, setLoadingMyPromos] = useState(true);
  const fileInputRef = useRef(null);

  const draft = state.draft;
  const canSubmit = draft.businessName.trim() && draft.discountLabel.trim();

  const statsValues = Object.values(stats);
  const totalFavorites = statsValues.reduce((sum, s) => sum + s.favorites_count, 0);
  const totalRedemptions = statsValues.reduce((sum, s) => sum + s.redemptions_count, 0);
  const maxCount = Math.max(1, ...statsValues.map((s) => Math.max(s.favorites_count, s.redemptions_count)));

  const loadMyPromos = () => {
    setLoadingMyPromos(true);
    fetchMyPromos()
      .then(setMyPromos)
      .finally(() => setLoadingMyPromos(false));
    fetchMyPromoStats()
      .then((rows) => setStats(Object.fromEntries(rows.map((r) => [r.promo_id, r]))))
      .catch(() => {});
    fetchMyPromoTimeseries()
      .then(setTimeseries)
      .catch(() => {});
  };

  useEffect(() => {
    loadMyPromos();
  }, []);

  const handlePhotoChange = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_PHOTOS - photoFiles.length);
    if (!files.length) return;
    const compressed = await Promise.all(files.map(compressImage));
    setPhotoFiles((prev) => [...prev, ...compressed]);
    setPhotoPreviews((prev) => [...prev, ...compressed.map((f) => URL.createObjectURL(f))]);
    setExistingPhotoUrls([]);
    e.target.value = '';
  };

  const removeNewPhoto = (index) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setEditingId(null);
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setExistingPhotoUrls([]);
    Object.entries(EMPTY_DRAFT).forEach(([field, value]) => setDraftField(field, value));
  };

  const startEditing = (promo) => {
    setEditingId(promo.id);
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setExistingPhotoUrls(promo.photoUrls || []);
    setDraftField('businessName', promo.business);
    setDraftField('category', promo.category);
    setDraftField('discountLabel', promo.discountLabel);
    setDraftField('expiry', promo.expiresAt || '');
    setDraftField('startsAt', promo.startsAt || '');
    setDraftField('redemptionLimit', promo.redemptionLimit ? String(promo.redemptionLimit) : '');
    setDraftField('businessHours', promo.businessHours || '');
    setDraftField('description', promo.description);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que querés borrar esta promoción?')) return;
    await deletePromo(id);
    if (editingId === id) resetForm();
    loadMyPromos();
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await updatePromo(editingId, draft, photoFiles);
      } else {
        await submitDraft(draft, photoFiles);
      }
      resetForm();
      loadMyPromos();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <h4 style={{ marginBottom: 4 }}>{editingId ? 'Editar promoción' : 'Publicar promoción'}</h4>
        <div className="text-muted">Como comercio, creá o actualizá una oferta</div>
      </div>

      <div className="screen-body screen-body--dark" style={{ gap: 14 }}>
        <div className="field">
          <label>Nombre del comercio</label>
          <input className="input" value={draft.businessName} onChange={(e) => setDraftField('businessName', e.target.value)} placeholder="Ej: Panadería Norte" />
        </div>
        <div className="field">
          <label>Rubro</label>
          <select className="input" value={draft.category} onChange={(e) => setDraftField('category', e.target.value)}>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Descuento</label>
            <input className="input" value={draft.discountLabel} onChange={(e) => setDraftField('discountLabel', e.target.value)} placeholder="Ej: 20% OFF" />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Válido hasta</label>
            <input className="input" type="date" value={draft.expiry} onChange={(e) => setDraftField('expiry', e.target.value)} min={new Date().toISOString().slice(0, 10)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Publicar a partir de (opcional)</label>
            <input
              className="input"
              type="date"
              value={draft.startsAt}
              onChange={(e) => setDraftField('startsAt', e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
            />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Límite de canjes por persona (opcional)</label>
            <input
              className="input"
              type="number"
              min="1"
              value={draft.redemptionLimit}
              onChange={(e) => setDraftField('redemptionLimit', e.target.value)}
              placeholder="Sin límite"
            />
          </div>
        </div>
        <div className="text-muted" style={{ fontSize: 11, marginTop: -8 }}>
          "Publicar a partir de" vacío = se ve apenas la publiqués. "Límite de canjes" vacío = sin límite por persona.
        </div>
        <div className="field">
          <label>Horario de atención (opcional)</label>
          <input
            className="input"
            value={draft.businessHours}
            onChange={(e) => setDraftField('businessHours', e.target.value)}
            placeholder="Ej: Lun a Sáb 9 a 20 hs"
          />
        </div>
        <div className="field">
          <label>Descripción</label>
          <textarea
            className="input"
            value={draft.description}
            onChange={(e) => setDraftField('description', e.target.value)}
            placeholder="Detalle de la promoción y condiciones"
          />
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoChange} style={{ display: 'none' }} />
        <div className="field">
          <label>Fotos del comercio (hasta {MAX_PHOTOS})</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {existingPhotoUrls.map((url, i) => (
              <div key={`existing-${i}`} style={{ width: 74, height: 74, borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
            {photoPreviews.map((url, i) => (
              <div key={`new-${i}`} style={{ position: 'relative', width: 74, height: 74, borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => removeNewPhoto(i)}
                  aria-label="Quitar foto"
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    fontSize: 12,
                    lineHeight: 1,
                    cursor: 'pointer',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            {existingPhotoUrls.length + photoFiles.length < MAX_PHOTOS && (
              <div
                className="dropzone"
                onClick={() => fileInputRef.current?.click()}
                style={{ width: 74, height: 74, cursor: 'pointer', fontSize: 10.5, padding: 6 }}
              >
                + Agregar
              </div>
            )}
          </div>
          {existingPhotoUrls.length > 0 && (
            <div className="text-muted" style={{ fontSize: 11 }}>
              Si elegís fotos nuevas, reemplazan a todas las actuales.
            </div>
          )}
        </div>

        <button type="button" className="btn btn-block" disabled={!canSubmit || submitting} onClick={handleSubmit}>
          {submitting ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Publicar promoción'}
        </button>
        {editingId && (
          <button type="button" className="auth-footer-link" style={{ alignSelf: 'center', fontSize: 12.5 }} onClick={resetForm}>
            Cancelar edición
          </button>
        )}
        {state.draftJustPublished && !editingId && (
          <div style={{ textAlign: 'center', color: 'var(--color-accent-400)', fontSize: 12.5, fontWeight: 700 }}>Promoción publicada con éxito</div>
        )}

        <hr className="hr" style={{ margin: '8px 0 4px' }} />
        <div style={{ fontWeight: 700, fontSize: 13 }}>Mis promociones publicadas</div>

        {!loadingMyPromos && myPromos.length > 0 && (
          <div className="stats-summary">
            <div className="stats-summary-item">
              <div className="stats-summary-value">{myPromos.length}</div>
              <div className="stats-summary-label">Promos activas</div>
            </div>
            <div className="stats-summary-item">
              <div className="stats-summary-value" style={{ color: '#e0577a' }}>
                {totalFavorites}
              </div>
              <div className="stats-summary-label">Guardados totales</div>
            </div>
            <div className="stats-summary-item">
              <div className="stats-summary-value">{totalRedemptions}</div>
              <div className="stats-summary-label">Canjes totales</div>
            </div>
          </div>
        )}

        {!loadingMyPromos && timeseries.length > 0 && (
          <div style={{ marginBottom: 6 }}>
            <div className="text-muted" style={{ fontSize: 11 }}>
              Canjes de los últimos 14 días
            </div>
            <TimeseriesChart data={timeseries} />
          </div>
        )}

        {loadingMyPromos && [1, 2].map((i) => <SkeletonListItem key={i} dark />)}
        {!loadingMyPromos &&
          myPromos.map((p) => {
            const promoStats = stats[p.id];
            const expired = isPastDate(p.expiresAt);
            const scheduled = isFutureDate(p.startsAt);
            return (
              <div key={p.id} className="published-row" style={{ flexWrap: 'wrap', gap: 6 }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{p.business}</div>
                  <div className="text-muted" style={{ fontSize: 11.5, marginTop: 2 }}>
                    {p.category} · {p.discountLabel}
                  </div>
                  {promoStats && (
                    <div style={{ marginTop: 6, maxWidth: 220 }}>
                      <div className="stats-bar-row">
                        <div className="stats-bar-track">
                          <div
                            className="stats-bar-fill stats-bar-fill--fav"
                            style={{ width: `${Math.min(100, (promoStats.favorites_count / maxCount) * 100)}%` }}
                          />
                        </div>
                        <div className="stats-bar-num">{promoStats.favorites_count}</div>
                      </div>
                      <div className="stats-bar-row">
                        <div className="stats-bar-track">
                          <div
                            className="stats-bar-fill stats-bar-fill--redeem"
                            style={{ width: `${Math.min(100, (promoStats.redemptions_count / maxCount) * 100)}%` }}
                          />
                        </div>
                        <div className="stats-bar-num">{promoStats.redemptions_count}</div>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {expired && <div className="tag" style={{ background: '#f3d6d6', color: '#8a2323' }}>VENCIDA</div>}
                  {!expired && scheduled && (
                    <div className="tag" style={{ background: '#dde6f7', color: '#2a4d8a' }}>
                      PROGRAMADA {p.startsAt}
                    </div>
                  )}
                  <button type="button" className="auth-footer-link" style={{ fontSize: 12 }} onClick={() => startEditing(p)}>
                    Editar
                  </button>
                  <button type="button" className="auth-footer-link" style={{ fontSize: 12, color: '#c62828' }} onClick={() => handleDelete(p.id)}>
                    Borrar
                  </button>
                </div>
              </div>
            );
          })}
        {!loadingMyPromos && myPromos.length === 0 && <div className="empty-state empty-state--dark">Todavía no publicaste ninguna promoción.</div>}
      </div>
    </div>
  );
}
