import { useState } from 'react';
import { useApp } from '../state/AppContext';
import Logo from '../components/Logo';

const SLIDES = [
  {
    title: 'Descubrí promociones cerca tuyo',
    text: 'Encontrá descuentos de comercios y bancos en gastronomía, indumentaria, supermercados y más.',
  },
  {
    title: 'Guardá tus favoritas',
    text: 'Guardá las promociones que te interesan y recibí un aviso antes de que venzan.',
  },
  {
    title: '¿Tenés un negocio?',
    text: 'Registrate como cuenta Negocio y publicá tus propias promociones para que más gente las encuentre.',
  },
];

export default function OnboardingScreen() {
  const { goTo } = useApp();
  const [index, setIndex] = useState(0);

  const finish = () => {
    localStorage.setItem('ahorrix-onboarded', '1');
    goTo('login');
  };

  const next = () => {
    if (index === SLIDES.length - 1) finish();
    else setIndex(index + 1);
  };

  const slide = SLIDES[index];

  return (
    <div className="auth-screen" style={{ justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
        <Logo />
      </div>

      <div style={{ textAlign: 'center', padding: '0 12px' }}>
        <h3 style={{ marginBottom: 12 }}>{slide.title}</h3>
        <div className="text-muted" style={{ color: 'var(--color-dark-text-muted)', fontSize: 14, lineHeight: 1.6 }}>
          {slide.text}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
          {SLIDES.map((_, i) => (
            <div
              key={i}
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: i === index ? 'var(--color-accent-400)' : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
        <button type="button" className="btn btn-primary btn-block" onClick={next}>
          {index === SLIDES.length - 1 ? 'Empezar' : 'Siguiente'}
        </button>
        <button type="button" className="auth-skip" onClick={finish}>
          Saltear
        </button>
      </div>
    </div>
  );
}
