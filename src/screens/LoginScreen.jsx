import { useApp } from '../state/AppContext';
import Logo from '../components/Logo';

export default function LoginScreen() {
  const { state, setLoginField, submitLogin, skipAuth, goTo } = useApp();
  const { email, password } = state.loginForm;
  const canSubmit = email.trim() && password;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canSubmit) submitLogin(email, password);
  };

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
          <label>Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setLoginField('email', e.target.value)} placeholder="tu@email.com" />
        </div>
        <div className="field">
          <label>Contraseña</label>
          <input className="input" type="password" value={password} onChange={(e) => setLoginField('password', e.target.value)} placeholder="••••••••" />
        </div>
        {state.authError && (
          <div style={{ color: '#ff9d9d', fontSize: 12.5 }}>{state.authError}</div>
        )}
        <button type="submit" className="btn btn-primary btn-block" disabled={!canSubmit || state.authSubmitting}>
          {state.authSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
        </button>
      </form>
      <div className="auth-footer">
        ¿No tenés cuenta?{' '}
        <span className="auth-footer-link" onClick={() => goTo('signup')}>
          Creá una
        </span>
      </div>
      <button type="button" className="auth-skip" onClick={skipAuth}>
        Continuar sin cuenta
      </button>
    </div>
  );
}
