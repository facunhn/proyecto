import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state/AppContext';
import { fetchMyPromos, updatePromo, deletePromo } from '../api/promosApi';
import { compressImage } from '../utils/image';

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
  const [loadingMyPromos, setLoadingMyPromos] = useState(true);
  const fileInputRef = useRef(null);

  const draft = state.draft;
  const canSubmit = draft.businessName.trim() && draft.discountLabel.trim();

  const loadMyPromos = () => {
    setLoadingMyPromos(true);
    fetchMyPromos()
      .then(setMyPromos)
      .finally(() => setLoadingMyPromos(false));
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
    setDraftField('expiry', promo.expiry);
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
            <input className="input" value={draft.expiry} onChange={(e) => setDraftField('expiry', e.target.value)} placeholder="Ej: 30/09" />
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
        {loadingMyPromos && <div className="empty-state">Cargando…</div>}
        {!loadingMyPromos &&
          myPromos.map((p) => (
            <div key={p.id} className="published-row">
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{p.business}</div>
                <div className="text-muted" style={{ fontSize: 11.5, marginTop: 2 }}>
                  {p.category} · {p.discountLabel}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button type="button" className="auth-footer-link" style={{ fontSize: 12 }} onClick={() => startEditing(p)}>
                  Editar
                </button>
                <button type="button" className="auth-footer-link" style={{ fontSize: 12, color: '#c62828' }} onClick={() => handleDelete(p.id)}>
                  Borrar
                </button>
              </div>
            </div>
          ))}
        {!loadingMyPromos && myPromos.length === 0 && <div className="empty-state">Todavía no publicaste ninguna promoción.</div>}
      </div>
    </div>
  );
}
