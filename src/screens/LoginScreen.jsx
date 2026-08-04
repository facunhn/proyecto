import { useState } from 'react';
import { useApp } from '../state/AppContext';
import Logo from '../components/Logo';
import PasswordField from '../components/PasswordField';

export default function LoginScreen() {
  const { state, setLoginField, submitLogin, skipAuth, goTo, sendPasswordReset } = useApp();
  const { email, password } = state.loginForm;
  const canSubmit = email.trim() && password;

  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canSubmit) submitLogin(email, password);
  };

  const openForgotMode = () => {
    setResetEmail(email);
    setResetSent(false);
    setForgotMode(true);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    await sendPasswordReset(resetEmail.trim());
    setResetSent(true);
  };

  if (forgotMode) {
    return (
      <div className="auth-screen">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <Logo />
        </div>
        <h3 style={{ marginBottom: 6 }}>Restablecer contraseña</h3>
        <div className="text-muted" style={{ color: 'var(--color-dark-text-muted)', marginBottom: 24 }}>
          Ingresá tu email y te mandamos instrucciones para crear una nueva contraseña
        </div>

        {resetSent ? (
          <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
            Si <strong>{resetEmail}</strong> tiene una cuenta con nosotros, te vamos a enviar un email con un link para elegir una nueva contraseña. Revisá también la carpeta de spam.
          </div>
        ) : (
          <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="field">
              <label htmlFor="reset-email">Email</label>
              <input id="reset-email" className="input" type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="tu@email.com" />
            </div>
            {state.authError && <div style={{ color: '#ff9d9d', fontSize: 12.5 }}>{state.authError}</div>}
            <button type="submit" className="btn btn-primary btn-block" disabled={!resetEmail.trim() || state.authSubmitting}>
              {state.authSubmitting ? 'Enviando…' : 'Enviar instrucciones'}
            </button>
          </form>
        )}

        <button type="button" className="auth-skip" onClick={() => setForgotMode(false)}>
          Volver a iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
        <Logo />
      </div>
      <h3 style={{ marginBottom: 6 }}>Iniciar sesión</h3>
      <div className="text-muted" style={{ color: 'var(--color-dark-text-muted)', marginBottom: 24 }}>
        Entrá para ver y guardar tus promociones
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" className="input" type="email" value={email} onChange={(e) => setLoginField('email', e.target.value)} placeholder="tu@email.com" />
        </div>
        <PasswordField label="Contraseña" value={password} onChange={(e) => setLoginField('password', e.target.value)} placeholder="••••••••" />
        <button type="button" className="auth-footer-link" style={{ textAlign: 'right', fontSize: 12.5 }} onClick={openForgotMode}>
          ¿Olvidaste tu contraseña?
        </button>
        {state.authError && (
          <div style={{ color: '#ff9d9d', fontSize: 12.5 }}>{state.authError}</div>
        )}
        <button type="submit" className="btn btn-primary btn-block" disabled={!canSubmit || state.authSubmitting}>
          {state.authSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
        </button>
      </form>
      <div className="auth-footer">
        ¿No tenés cuenta?{' '}
        <button type="button" className="auth-footer-link" onClick={() => goTo('signup')}>
          Creá una
        </button>
      </div>
      <button type="button" className="auth-skip" onClick={skipAuth}>
        Continuar sin cuenta
      </button>
    </div>
  );
}
