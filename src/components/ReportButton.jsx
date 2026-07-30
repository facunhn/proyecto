import { useState } from 'react';
import { submitReport } from '../api/reportsApi';
import { useApp } from '../state/AppContext';

export default function ReportButton({ targetType, targetId, label = 'Reportar' }) {
  const { requireAuth } = useApp();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setSending(true);
    setError(null);
    try {
      await submitReport(targetType, targetId, reason.trim());
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="auth-footer-link"
        style={{ fontSize: 11.5, color: '#c62828' }}
        onClick={() => {
          if (requireAuth()) setOpen(true);
        }}
      >
        {label}
      </button>

      {open && (
        <div className="qr-modal-overlay" onClick={() => setOpen(false)}>
          <div className="qr-modal-card" onClick={(e) => e.stopPropagation()} style={{ alignItems: 'stretch', gap: 10 }}>
            {done ? (
              <>
                <div style={{ fontWeight: 700, color: '#1a1330' }}>Gracias, recibimos tu denuncia.</div>
                <button type="button" className="btn btn-secondary btn-block" onClick={() => setOpen(false)}>
                  Cerrar
                </button>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 700, color: '#1a1330' }}>¿Por qué querés reportar esto?</div>
                <textarea
                  className="input"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej: parece falsa, contenido ofensivo, etc."
                />
                {error && <div style={{ color: '#c62828', fontSize: 12 }}>{error}</div>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn" style={{ flex: 1, background: '#c62828', color: '#fff' }} disabled={!reason.trim() || sending} onClick={handleSubmit}>
                    {sending ? 'Enviando…' : 'Enviar denuncia'}
                  </button>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setOpen(false)}>
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
