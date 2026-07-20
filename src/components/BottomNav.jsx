import { useApp } from '../state/AppContext';
import { HomeIcon, SearchIcon, HeartIcon, PlusCircleIcon, PinIcon, ProfileIcon } from './icons';

const NAV_ITEMS = [
  { key: 'home', label: 'Inicio', Icon: HomeIcon },
  { key: 'search', label: 'Buscar', Icon: SearchIcon },
  { key: 'nearby', label: 'Cerca', Icon: PinIcon },
  { key: 'favorites', label: 'Favoritos', Icon: HeartIcon },
  { key: 'publish', label: 'Publicar', Icon: PlusCircleIcon, businessOnly: true },
  { key: 'profile', label: 'Perfil', Icon: ProfileIcon },
];

export default function BottomNav() {
  const { state, goTo } = useApp();
  const items = NAV_ITEMS.filter((item) => !item.businessOnly || state.accountType === 'negocio');

  return (
    <nav className="bottom-nav">
      {items.map(({ key, label, Icon }) => {
        const active = state.screen === key;
        const color = active ? 'var(--color-accent-400)' : 'rgba(255,255,255,0.55)';
        return (
          <button key={key} type="button" className="bottom-nav-item" onClick={() => goTo(key)}>
            <Icon size={19} style={{ stroke: color }} />
            <div className="bottom-nav-label" style={{ color }}>
              {label}
            </div>
          </button>
        );
      })}
    </nav>
  );
}
