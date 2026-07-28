import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state/AppContext';
import { fetchMyPromos, fetchMyPromoStats, updatePromo, deletePromo } from '../api/promosApi';
import { compressImage } from '../utils/image';
import { isPastDate } from '../utils/date';
import SkeletonListItem from '../components/SkeletonListItem';

const CATEGORY_OPTIONS = [
  { value: 'Gastronomía', label: 'Gastronomía' },
  { value: 'Retail', label: 'Retail' },
  { value: 'Supermercados', label: 'Supermercados' },
  { value: 'Farmacias', label: 'Farmacias' },
  { value: 'Bancos', label: 'Promoción bancaria' },
];

const EMPTY_DRAFT = { businessName: '', category: 'Gastronomía', discountLabel: '', expiry: '', description: '' };

export default function PublishScreen() {
  const { state, setDraftField, submitDraft } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [myPromos, setMyPromos] = useState([]);
  const [stats, setStats] = useState({});
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
  };

  useEffect(() => {
    loadMyPromos();
  }, []);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setPhotoFile(compressed);
    setPhotoPreview(URL.createObjectURL(compressed));
  };

  const resetForm = () => {
    setEditingId(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    Object.entries(EMPTY_DRAFT).forEach(([field, value]) => setDraftField(field, value));
  };

  const startEditing = (promo) => {
    setEditingId(promo.id);
    setPhotoFile(null);
    setPhotoPreview(promo.imageUrl || null);
    setDraftField('businessName', promo.business);
    setDraftField('category', promo.category);
    setDraftField('discountLabel', promo.discountLabel);
    setDraftField('expiry', promo.expiresAt || '');
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
        await updatePromo(editingId, draft, photoFile);
      } else {
        await submitDraft(draft, photoFile);
      }
      resetForm();
      loadMyPromos();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="screen">
      <div className="screen-header screen-header--plain">
        <h4 style={{ marginBottom: 4, color: 'var(--color-text)' }}>{editingId ? 'Editar promoción' : 'Publicar promoción'}</h4>
        <div className="text-muted">Como comercio, creá o actualizá una oferta</div>
      </div>

      <div className="screen-body" style={{ gap: 14 }}>
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
        <div className="field">
          <label>Descripción</label>
          <textarea
            className="input"
            value={draft.description}
            onChange={(e) => setDraftField('description', e.target.value)}
            placeholder="Detalle de la promoción y condiciones"
          />
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
        <div className="dropzone" onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer', overflow: 'hidden', padding: photoPreview ? 0 : undefined }}>
          {photoPreview ? (
            <img src={photoPreview} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <>
              Foto o logo del comercio
              <br />
              <br />
              (tocá para elegir una imagen)
            </>
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
          <div style={{ textAlign: 'center', color: 'var(--color-accent-700)', fontSize: 12.5, fontWeight: 700 }}>Promoción publicada con éxito</div>
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

        {loadingMyPromos && [1, 2].map((i) => <SkeletonListItem key={i} />)}
        {!loadingMyPromos &&
          myPromos.map((p) => {
            const promoStats = stats[p.id];
            const expired = isPastDate(p.expiresAt);
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
        {!loadingMyPromos && myPromos.length === 0 && <div className="empty-state">Todavía no publicaste ninguna promoción.</div>}
      </div>
    </div>
  );
}
