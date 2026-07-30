import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/icons';

const FAQ = [
  {
    q: '¿Cómo canjeo una promoción?',
    a: 'Entrá al detalle de la promoción y tocá "Mostrar código en el local". Te va a aparecer un código y un QR para que el comercio lo verifique.',
  },
  {
    q: '¿Cómo publico una promoción como negocio?',
    a: 'Al crear tu cuenta elegí "Negocio". Vas a tener una sección "Publicar" en la barra de abajo para cargar tus ofertas.',
  },
  {
    q: '¿Por qué no veo el botón de "Publicar"?',
    a: 'Ese botón solo aparece si tu cuenta es de tipo Negocio. El tipo de cuenta se define al registrarte y no se puede cambiar después.',
  },
  {
    q: '¿Cómo activo las notificaciones push?',
    a: 'Andá a Perfil y activá "Avisos push en este dispositivo". Te va a pedir permiso del navegador para mostrar notificaciones.',
  },
  {
    q: '¿Puedo borrar mi cuenta?',
    a: 'Sí, desde Perfil → "Borrar mi cuenta". Es permanente: se borran también tus promociones publicadas si tenés cuenta de negocio.',
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="published-row" style={{ flexDirection: 'column', alignItems: 'stretch', cursor: 'pointer' }} onClick={() => setOpen((v) => !v)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 13.5 }}>{q}</div>
        <ChevronRightIcon size={14} style={{ transform: open ? 'rotate(90deg)' : 'none', color: 'var(--color-dark-text-muted)' }} />
      </div>
      {open && <div style={{ fontSize: 12.5, marginTop: 8, color: 'var(--color-dark-text-muted)', lineHeight: 1.5 }}>{a}</div>}
    </div>
  );
}

export default function HelpScreen() {
  const { goTo } = useApp();

  return (
    <div className="screen">
      <div className="screen-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" className="btn btn-icon btn-secondary" onClick={() => goTo('profile')} aria-label="Volver">
          <ChevronLeftIcon size={16} strokeWidth="2.2" />
        </button>
        <h4>Ayuda</h4>
      </div>

      <div className="screen-body screen-body--dark">
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Preguntas frecuentes</div>
        {FAQ.map((item) => (
          <FaqItem key={item.q} q={item.q} a={item.a} />
        ))}

        <hr className="hr" />
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>¿No encontraste lo que buscabas?</div>
        <a
          className="btn btn-primary btn-block"
          href="https://wa.me/5490000000000?text=Hola%2C%20necesito%20ayuda%20con%20Ahorrix"
          target="_blank"
          rel="noreferrer"
        >
          Escribinos por WhatsApp
        </a>
        <a className="btn btn-secondary btn-block" style={{ marginTop: 10 }} href="mailto:soporte@ahorrix.app">
          Escribinos por email
        </a>

        <hr className="hr" />
        <button type="button" className="auth-footer-link" style={{ fontSize: 12.5, textAlign: 'left' }} onClick={() => goTo('terms')}>
          Términos y condiciones
        </button>
        <button type="button" className="auth-footer-link" style={{ fontSize: 12.5, textAlign: 'left', marginTop: 10 }} onClick={() => goTo('privacy')}>
          Política de privacidad
        </button>
      </div>
    </div>
  );
}
