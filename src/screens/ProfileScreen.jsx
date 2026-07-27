import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { accountInitials, profileName } from '../utils/account';
import { SwitchIcon, ProfileIcon, HistoryIcon, BellIcon, HelpIcon, LogoutIcon, ChevronRightIcon } from '../components/icons';

export default function ProfileScreen() {
  const { state, toggleAccount, logout, goTo, deleteMyAccount } = useApp();
  const isNegocio = state.accountType === 'negocio';
  const accountLabel = isNegocio ? 'Cuenta negocio' : 'Cuenta personal';
  const switchLabel = isNegocio ? 'cuenta personal' : 'cuenta negocio';

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText.trim().toUpperCase() !== 'BORRAR') return;
    setDeleting(true);
    const ok = await deleteMyAccount();
    setDeleting(false);
    if (!ok) return;
  };

  return (
    <div className="screen">
      <div className="profile-header">
        <div className="profile-avatar">{accountInitials(state.session, state.accountType)}</div>
        <div style={{ color: 'var(--color-dark-text)', fontWeight: 700, fontSize: 16 }}>{profileName(state.session, state.accountType)}</div>
        <div className="tag tag-accent" style={{ background: 'var(--color-accent-400)', color: 'var(--color-brand-violet)' }}>
          {accountLabel}
        </div>
      </div>

      <div className="screen-body">
        <button type="button" className="profile-row" onClick={toggleAccount}>
          <div className="profile-row-left">
            <SwitchIcon size={18} />
            <div>Cambiar a {switchLabel}</div>
          </div>
          <ChevronRightIcon size={16} style={{ color: 'var(--color-neutral-600)' }} />
        </button>
        <button type="button" className="profile-row" onClick={() => goTo('editProfile')}>
          <div className="profile-row-left">
            <ProfileIcon size={18} />
            <div>Mis datos</div>
          </div>
          <ChevronRightIcon size={16} style={{ color: 'var(--color-neutral-600)' }} />
        </button>
        <button type="button" className="profile-row" onClick={() => goTo('redemptions')}>
          <div className="profile-row-left">
            <HistoryIcon size={18} />
            <div>Historial de canjes</div>
          </div>
          <ChevronRightIcon size={16} style={{ color: 'var(--color-neutral-600)' }} />
        </button>
        <button type="button" className="profile-row" onClick={() => goTo('notifications')}>
          <div className="profile-row-left">
            <BellIcon size={18} />
            <div>Notificaciones</div>
          </div>
          <ChevronRightIcon size={16} style={{ color: 'var(--color-neutral-600)' }} />
        </button>
        <div className="profile-row" role="button" tabIndex={0}>
          <div className="profile-row-left">
            <HelpIcon size={18} />
            <div>Ayuda</div>
          </div>
          <ChevronRightIcon size={16} style={{ color: 'var(--color-neutral-600)' }} />
        </div>
        <button type="button" className="profile-row" style={{ padding: '18px 0', gap: 12 }} onClick={logout}>
          <div className="profile-row-left" style={{ color: 'var(--color-accent-700)' }}>
            <LogoutIcon size={18} style={{ color: 'var(--color-accent-700)' }} />
            <div style={{ fontWeight: 700 }}>Cerrar sesión</div>
          </div>
        </button>

        {state.session && !confirmingDelete && (
          <button
            type="button"
            className="profile-row"
            style={{ borderBottom: 'none', padding: '18px 0' }}
            onClick={() => setConfirmingDelete(true)}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#c62828' }}>Borrar mi cuenta</div>
          </button>
        )}

        {confirmingDelete && (
          <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
              Esto borra tu cuenta y todas tus promociones publicadas <strong>para siempre</strong>. No se puede deshacer. Escribí{' '}
              <strong>BORRAR</strong> para confirmar.
            </div>
            <input className="input" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="BORRAR" />
            {state.authError && <div style={{ color: '#c62828', fontSize: 12 }}>{state.authError}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn"
                style={{ flex: 1, background: '#c62828', color: '#fff' }}
                disabled={confirmText.trim().toUpperCase() !== 'BORRAR' || deleting}
                onClick={handleDeleteAccount}
              >
                {deleting ? 'Borrando…' : 'Borrar mi cuenta'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => {
                  setConfirmingDelete(false);
                  setConfirmText('');
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
