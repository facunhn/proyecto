import { useEffect, useState } from 'react';
import { useApp } from '../state/AppContext';
import { fetchAllReports, resolveReport } from '../api/reportsApi';
import { ChevronLeftIcon } from '../components/icons';
import SkeletonListItem from '../components/SkeletonListItem';

const TARGET_LABELS = { promo: 'Promoción', review: 'Reseña' };

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminReportsScreen() {
  const { goTo } = useApp();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);

  const load = () => {
    setLoading(true);
    fetchAllReports()
      .then(setReports)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleResolve = async (id) => {
    setResolvingId(id);
    try {
      await resolveReport(id);
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, resolved: true } : r)));
    } finally {
      setResolvingId(null);
    }
  };

  const pending = reports.filter((r) => !r.resolved);
  const resolved = reports.filter((r) => r.resolved);

  return (
    <div className="screen">
      <div className="screen-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" className="btn btn-icon btn-secondary" onClick={() => goTo('profile')} aria-label="Volver">
          <ChevronLeftIcon size={16} strokeWidth="2.2" />
        </button>
        <div>
          <h4 style={{ marginBottom: 4 }}>Denuncias</h4>
          <div className="text-muted">Contenido reportado por los usuarios</div>
        </div>
      </div>

      <div className="screen-body screen-body--dark">
        {loading && [1, 2, 3].map((i) => <SkeletonListItem key={i} dark />)}

        {!loading && pending.length === 0 && resolved.length === 0 && (
          <div className="empty-state empty-state--dark">No hay denuncias todavía.</div>
        )}

        {!loading && pending.length > 0 && (
          <>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Pendientes ({pending.length})</div>
            {pending.map((r) => (
              <div key={r.id} className="published-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div className="tag" style={{ background: '#dde6f7', color: '#2a4d8a' }}>
                    {TARGET_LABELS[r.target_type] || r.target_type} #{r.target_id}
                  </div>
                  <div className="text-muted" style={{ fontSize: 11 }}>
                    {formatDate(r.created_at)}
                  </div>
                </div>
                <div style={{ fontSize: 13 }}>{r.reason}</div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ alignSelf: 'flex-start', fontSize: 12 }}
                  disabled={resolvingId === r.id}
                  onClick={() => handleResolve(r.id)}
                >
                  {resolvingId === r.id ? 'Guardando…' : 'Marcar como resuelta'}
                </button>
              </div>
            ))}
          </>
        )}

        {!loading && resolved.length > 0 && (
          <>
            <hr className="hr" style={{ margin: '14px 0' }} />
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Resueltas ({resolved.length})</div>
            {resolved.map((r) => (
              <div key={r.id} className="published-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 4, opacity: 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div className="tag">{TARGET_LABELS[r.target_type] || r.target_type} #{r.target_id}</div>
                  <div className="text-muted" style={{ fontSize: 11 }}>
                    {formatDate(r.created_at)}
                  </div>
                </div>
                <div style={{ fontSize: 13 }}>{r.reason}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
