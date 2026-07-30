import { useApp } from '../state/AppContext';
import { ChevronLeftIcon } from '../components/icons';

export default function TermsScreen() {
  const { goTo } = useApp();

  return (
    <div className="screen">
      <div className="screen-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" className="btn btn-icon btn-secondary" onClick={() => goTo('help')} aria-label="Volver">
          <ChevronLeftIcon size={16} strokeWidth="2.2" />
        </button>
        <h4>Términos y condiciones</h4>
      </div>
      <div className="screen-body screen-body--dark" style={{ fontSize: 13, lineHeight: 1.7 }}>
        <p style={{ color: 'var(--color-accent-400)', fontWeight: 700 }}>
          Este texto es una plantilla genérica de referencia, no un documento legal validado. Antes de publicar la app reemplazalo con
          términos revisados por un abogado.
        </p>
        <p>
          <strong>1. Qué es Ahorrix.</strong> Ahorrix es una plataforma que conecta usuarios con promociones publicadas por comercios
          adheridos. Ahorrix no participa en la venta ni en la validez legal de cada promoción: es responsabilidad del comercio que la
          publica.
        </p>
        <p>
          <strong>2. Cuentas.</strong> Al registrarte, elegís si tu cuenta es "Persona" o "Negocio". El tipo de cuenta no puede cambiarse
          luego de creada. Sos responsable de la información que cargues y de mantener tu contraseña segura.
        </p>
        <p>
          <strong>3. Publicación de promociones.</strong> Los comercios son responsables de que las promociones publicadas sean reales,
          vigentes y se respeten en el punto de venta. Ahorrix puede remover contenido que incumpla estos términos.
        </p>
        <p>
          <strong>4. Reseñas.</strong> Las reseñas reflejan la opinión de cada usuario. Ahorrix no verifica la veracidad de cada reseña
          individual, pero puede remover contenido ofensivo o falso si es reportado.
        </p>
        <p>
          <strong>5. Cuenta y datos.</strong> Podés borrar tu cuenta en cualquier momento desde Perfil. Al hacerlo, tus datos y (si sos
          negocio) tus promociones publicadas se eliminan de forma permanente.
        </p>
        <p>
          <strong>6. Cambios.</strong> Estos términos pueden actualizarse. El uso continuado de la app implica la aceptación de la
          versión vigente.
        </p>
      </div>
    </div>
  );
}
