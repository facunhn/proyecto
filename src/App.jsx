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
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import RedemptionsScreen from './screens/RedemptionsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import BusinessProfileScreen from './screens/BusinessProfileScreen';
import HelpScreen from './screens/HelpScreen';
import TermsScreen from './screens/TermsScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import OnboardingScreen from './screens/OnboardingScreen';

const SCREENS = {
  onboarding: OnboardingScreen,
  login: LoginScreen,
  signup: SignupScreen,
  resetPassword: ResetPasswordScreen,
  home: HomeScreen,
  search: SearchScreen,
  detail: DetailScreen,
  favorites: FavoritesScreen,
  publish: PublishScreen,
  nearby: NearbyScreen,
  profile: ProfileScreen,
  editProfile: EditProfileScreen,
  redemptions: RedemptionsScreen,
  notifications: NotificationsScreen,
  business: BusinessProfileScreen,
  help: HelpScreen,
  terms: TermsScreen,
  privacy: PrivacyScreen,
};

const NO_NAV_SCREENS = ['onboarding', 'login', 'signup', 'resetPassword'];

function AppShell() {
  const { state } = useApp();
  const Screen = SCREENS[state.screen] || HomeScreen;
  const showBottomNav = !NO_NAV_SCREENS.includes(state.screen);

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
