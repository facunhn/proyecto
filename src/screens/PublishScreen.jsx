import { useState } from 'react';
import { useApp } from '../state/AppContext';

const CATEGORY_OPTIONS = [
  { value: 'Gastronomía', label: 'Gastronomía' },
  { value: 'Retail', label: 'Retail' },
  { value: 'Supermercados', label: 'Supermercados' },
  { value: 'Farmacias', label: 'Farmacias' },
  { value: 'Bancos', label: 'Promoción bancaria' },
];

export default function PublishScreen() {
  const { state, setDraftField, submitDraft } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const draft = state.draft;
  const canSubmit = draft.businessName.trim() && draft.discountLabel.trim();

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await submitDraft(draft);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="screen">
      <div className="screen-header screen-header--plain">
        <h4 style={{ marginBottom: 4, color: 'var(--color-text)' }}>Publicar promoción</h4>
        <div className="text-muted">Como comercio, creá una nueva oferta</div>
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
        <div className="dropzone">
          Foto o logo del comercio
          <br />
          <br />
          (arrastrar imagen)
        </div>
        <button type="button" className="btn btn-block" disabled={!canSubmit || submitting} onClick={handleSubmit}>
          {submitting ? 'Publicando…' : 'Publicar promoción'}
        </button>
        {state.draftJustPublished && (
          <div style={{ textAlign: 'center', color: 'var(--color-accent-700)', fontSize: 12.5, fontWeight: 700 }}>Promoción publicada con éxito</div>
        )}

        <hr className="hr" style={{ margin: '8px 0 4px' }} />
        <div style={{ fontWeight: 700, fontSize: 13 }}>Mis promociones publicadas</div>
        {state.publishedPromos.map((p, i) => (
          <div key={i} className="published-row">
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{p.business}</div>
              <div className="text-muted" style={{ fontSize: 11.5, marginTop: 2 }}>
                {p.category} · {p.discountLabel}
              </div>
            </div>
            <div className="tag tag-accent">ACTIVA</div>
          </div>
        ))}
        {state.publishedPromos.length === 0 && <div className="empty-state">Todavía no publicaste ninguna promoción.</div>}
      </div>
    </div>
  );
}
