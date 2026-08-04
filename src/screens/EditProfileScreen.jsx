import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { ChevronLeftIcon } from '../components/icons';

const CATEGORY_OPTIONS = ['Gastronomía', 'Indumentaria', 'Electrodomésticos', 'Supermercados', 'Farmacias', 'Bancos'];

export default function EditProfileScreen() {
  const { state, goTo, updateMyProfile } = useApp();
  const session = state.session || {};
  const isNegocio = state.accountType === 'negocio';

  const [name, setName] = useState(session.name || '');
  const [phone, setPhone] = useState(session.phone || '');
  const [address, setAddress] = useState(session.address || '');
  const [city, setCity] = useState(session.city || '');
  const [category, setCategory] = useState(session.category || 'Gastronomía');
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaved(false);
    const fields = isNegocio ? { name, phone, address, city, category } : { name, phone, address, city };
    const ok = await updateMyProfile(fields);
    if (ok) setSaved(true);
  };

  return (
    <div className="screen">
      <div className="screen-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" className="btn btn-icon btn-secondary" onClick={() => goTo('profile')} aria-label="Volver">
          <ChevronLeftIcon size={16} strokeWidth="2.2" />
        </button>
        <div>
          <h4 style={{ marginBottom: 4 }}>Mis datos</h4>
          <div className="text-muted">Actualizá tu información de contacto</div>
        </div>
      </div>

      <div className="screen-body screen-body--dark" style={{ gap: 14 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label htmlFor="edit-name">{isNegocio ? 'Nombre del comercio' : 'Nombre'}</label>
            <input id="edit-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Juana Pérez" />
          </div>
          {isNegocio && (
            <div className="field">
              <label htmlFor="edit-category">Rubro</label>
              <select id="edit-category" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="field">
            <label htmlFor="edit-address">Dirección</label>
            <input id="edit-address" className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle y número" />
          </div>
          <div className="field">
            <label htmlFor="edit-city">Ciudad</label>
            <input id="edit-city" className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ej: Buenos Aires" />
          </div>
          <div className="field">
            <label htmlFor="edit-phone">Teléfono</label>
            <input id="edit-phone" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ej: 11 5555-5555" />
          </div>
          <div className="field">
            <label htmlFor="edit-email">Email</label>
            <input id="edit-email" className="input" value={session.email || ''} disabled style={{ opacity: 0.6 }} />
          </div>
          {state.authError && <div style={{ color: '#c62828', fontSize: 12.5 }}>{state.authError}</div>}
          {saved && <div style={{ color: 'var(--color-accent-400)', fontSize: 12.5, fontWeight: 700 }}>Datos guardados correctamente.</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={state.authSubmitting}>
            {state.authSubmitting ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}
