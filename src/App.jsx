import { AppProvider, useApp } from './state/AppContext';
import BottomNav from './components/BottomNav';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import DetailScreen from './screens/DetailScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import PublishScreen from './screens/PublishScreen';
import NearbyScreen from './screens/NearbyScreen';
import ProfileScreen from './screens/ProfileScreen';

const SCREENS = {
  login: LoginScreen,
  signup: SignupScreen,
  home: HomeScreen,
  search: SearchScreen,
  detail: DetailScreen,
  favorites: FavoritesScreen,
  publish: PublishScreen,
  nearby: NearbyScreen,
  profile: ProfileScreen,
};

function AppShell() {
  const { state } = useApp();
  const Screen = SCREENS[state.screen] || HomeScreen;
  const showBottomNav = state.screen !== 'login' && state.screen !== 'signup';

  return (
    <div className="app-root">
      <div className="app-shell">
        <Screen />
        {showBottomNav && <BottomNav />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
