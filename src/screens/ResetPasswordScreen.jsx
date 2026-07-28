import { useState } from 'react';
import { useApp } from '../state/AppContext';
import Logo from '../components/Logo';
import PasswordField from '../components/PasswordField';

export default function ResetPasswordScreen() {
  const { state, submitPasswordReset } = useApp();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordsMatch = password && password === confirmPassword;
  const canSubmit = password.length >= 6 && passwordsMatch;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canSubmit) submitPasswordReset(password);
  };

  return (
    <div className="auth-screen">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
        <Logo />
      </div>
      <h3 style={{ marginBottom: 6 }}>Elegí una nueva contraseña</h3>
      <div className="text-muted" style={{ color: 'var(--color-dark-text-muted)', marginBottom: 24 }}>
        Escribila dos veces para confirmar que no te equivocaste
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <PasswordField label="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
        <PasswordField label="Confirmar contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
        {confirmPassword && !passwordsMatch && <div style={{ color: '#ff9d9d', fontSize: 12.5 }}>Las contraseñas no coinciden.</div>}
        {state.authError && <div style={{ color: '#ff9d9d', fontSize: 12.5 }}>{state.authError}</div>}
        <button type="submit" className="btn btn-primary btn-block" disabled={!canSubmit || state.authSubmitting}>
          {state.authSubmitting ? 'Guardando…' : 'Guardar nueva contraseña'}
        </button>
      </form>
    </div>
  );
}
