import { useEffect, useState } from 'react';
import { useApp } from '../state/AppContext';
import { fetchNotifications, markNotificationsRead } from '../api/notificationsApi';
import { ChevronLeftIcon } from '../components/icons';

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Recién';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} día${days === 1 ? '' : 's'}`;
}

export default function NotificationsScreen() {
  const { goTo } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications()
      .then((list) => {
        setNotifications(list);
        const unreadIds = list.filter((n) => !n.read).map((n) => n.id);
        markNotificationsRead(unreadIds);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="screen">
      <div className="screen-header screen-header--plain" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" className="btn btn-icon btn-secondary" onClick={() => goTo('home')} aria-label="Volver">
          <ChevronLeftIcon size={16} strokeWidth="2.2" />
        </button>
        <h4 style={{ color: 'var(--color-text)' }}>Notificaciones</h4>
      </div>

      <div className="screen-body">
        {loading &&
          [1, 2, 3].map((i) => (
            <div key={i} className="published-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
              <div className="skeleton" style={{ height: 13, width: '85%' }} />
              <div className="skeleton" style={{ height: 11, width: '35%' }} />
            </div>
          ))}
        {!loading &&
          notifications.map((n) => (
            <div key={n.id} className="published-row" style={{ alignItems: 'flex-start' }}>
              <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{n.message}</div>
              <div className="text-muted" style={{ fontSize: 11, whiteSpace: 'nowrap', marginLeft: 10 }}>
                {timeAgo(n.created_at)}
              </div>
            </div>
          ))}
        {!loading && notifications.length === 0 && <div className="empty-state">No tenés notificaciones todavía.</div>}
      </div>
    </div>
  );
}
