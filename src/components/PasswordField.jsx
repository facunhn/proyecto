import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './icons';

export default function PasswordField({ label, value, onChange, placeholder }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="field">
      <label>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          className="input"
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ paddingRight: 40 }}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          style={{
            position: 'absolute',
            right: 2,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            display: 'flex',
            color: 'var(--color-text-muted)',
          }}
        >
          {visible ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
        </button>
      </div>
    </div>
  );
}
