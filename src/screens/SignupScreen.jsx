import { useApp } from '../state/AppContext';
import Logo from '../components/Logo';

const NEGOCIO_CATEGORIES = ['Gastronomía', 'Retail', 'Supermercados', 'Farmacias', 'Bancos'];

export default function SignupScreen() {
  const { state, setSignupField, submitSignup, goTo } = useApp();
  const form = state.signupForm;
  const isNegocio = form.accountType === 'negocio';
  const canSubmit = form.name.trim() && form.email.trim() && form.password;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canSubmit) submitSignup(form);
  };

  return (
    <div className="auth-screen">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <Logo />
      </div>
      <h3 style={{ marginBottom: 6 }}>Crear cuenta</h3>
      <div className="text-muted" style={{ color: 'var(--color-dark-text-muted)', marginBottom: 20 }}>
        Elegí el tipo de cuenta que necesitás
      </div>
      <div className="seg" style={{ marginBottom: 16 }}>
        <button type="button" className={`seg-opt${!isNegocio ? ' is-active' : ''}`} onClick={() => setSignupField('accountType', 'persona')}>
          <span style={{ fontWeight: 700 }}>Persona</span>
        </button>
        <button type="button" className={`seg-opt${isNegocio ? ' is-active' : ''}`} onClick={() => setSignupField('accountType', 'negocio')}>
          <span style={{ fontWeight: 700 }}>Negocio</span>
        </button>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="field">
          <label>{isNegocio ? 'Nombre del comercio' : 'Nombre'}</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setSignupField('name', e.target.value)}
            placeholder={isNegocio ? 'Ej: Panadería Norte' : 'Ej: Juana Pérez'}
          />
        </div>

        {isNegocio && (
          <>
            <div className="field">
              <label>Rubro</label>
              <select className="input" value={form.category} onChange={(e) => setSignupField('category', e.target.value)}>
                {NEGOCIO_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'Bancos' ? 'Banco / Financiera' : cat}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Dirección</label>
                <input className="input" value={form.address} onChange={(e) => setSignupField('address', e.target.value)} placeholder="Calle y número" />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Teléfono</label>
                <input className="input" value={form.phone} onChange={(e) => setSignupField('phone', e.target.value)} placeholder="Ej: 11 5555-5555" />
              </div>
            </div>
          </>
        )}

        <div className="field">
          <label>Email</label>
          <input className="input" type="email" value={form.email} onChange={(e) => setSignupField('email', e.target.value)} placeholder="tu@email.com" />
        </div>
        <div className="field">
          <label>Contraseña</label>
          <input className="input" type="password" value={form.password} onChange={(e) => setSignupField('password', e.target.value)} placeholder="••••••••" />
        </div>
        {state.authError && <div style={{ color: '#ff9d9d', fontSize: 12.5 }}>{state.authError}</div>}
        <button type="submit" className="btn btn-primary btn-block" disabled={!canSubmit || state.authSubmitting}>
          {state.authSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
      <div className="auth-footer">
        ¿Ya tenés cuenta?{' '}
        <span className="auth-footer-link" onClick={() => goTo('login')}>
          Iniciá sesión
        </span>
      </div>
    </div>
  );
}
