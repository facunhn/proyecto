import { useApp } from '../state/AppContext';
import { ChevronLeftIcon } from '../components/icons';

export default function PrivacyScreen() {
  const { goTo } = useApp();

  return (
    <div className="screen">
      <div className="screen-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" className="btn btn-icon btn-secondary" onClick={() => goTo('help')} aria-label="Volver">
          <ChevronLeftIcon size={16} strokeWidth="2.2" />
        </button>
        <h4>Política de privacidad</h4>
      </div>
      <div className="screen-body screen-body--dark" style={{ fontSize: 13, lineHeight: 1.7 }}>
        <p style={{ color: 'var(--color-accent-400)', fontWeight: 700 }}>
          Este texto es una plantilla genérica de referencia, no un documento legal validado. Antes de publicar la app reemplazalo con
          una política revisada por un abogado, ajustada a las leyes de tu país.
        </p>
        <p>
          <strong>1. Datos que recolectamos.</strong> Email, nombre, teléfono y dirección (si los cargás), tu tipo de cuenta, tus
          favoritos, tu historial de canjes, y — si activás las notificaciones push — una referencia técnica de tu dispositivo
          (suscripción push) para poder enviarte avisos.
        </p>
        <p>
          <strong>2. Ubicación.</strong> Si activás el geolocalizador, usamos tu ubicación solo para calcular distancias a las
          promociones cercanas. No se guarda un historial de tus ubicaciones.
        </p>
        <p>
          <strong>3. Con quién se comparte.</strong> Los datos se guardan en Supabase (nuestro proveedor de base de datos e
          infraestructura). No vendemos tus datos a terceros.
        </p>
        <p>
          <strong>4. Reseñas.</strong> Si dejás una reseña de un comercio, esa reseña (calificación y comentario) es visible
          públicamente para cualquiera que vea el perfil de ese comercio.
        </p>
        <p>
          <strong>5. Tus derechos.</strong> Podés editar tus datos en cualquier momento desde "Mis datos", y borrar tu cuenta y toda tu
          información desde Perfil → "Borrar mi cuenta".
        </p>
      </div>
    </div>
  );
}
