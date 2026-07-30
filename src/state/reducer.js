export const initialState = {
  screen: 'login',
  accountType: 'persona',
  session: null,

  loginForm: { email: '', password: '' },
  signupForm: { name: '', email: '', password: '', accountType: 'persona', category: 'Gastronomía', address: '', phone: '' },
  authError: null,
  authSubmitting: false,

  geoStatus: 'idle',
  coords: null,

  homeCategory: 'Todos',
  searchQuery: '',
  searchCategory: 'Todos',
  bankOnly: false,

  favorites: [],
  selectedId: null,
  selectedBusinessId: null,

  draft: { businessName: '', category: 'Gastronomía', discountLabel: '', expiry: '', startsAt: '', redemptionLimit: '', businessHours: '', description: '' },
  draftJustPublished: false,
  publishedPromos: [],

  promos: [],
  promosLoading: true,
  promosError: null,
};

export function reducer(state, action) {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };

    case 'SET_LOGIN_FIELD':
      return { ...state, loginForm: { ...state.loginForm, [action.field]: action.value } };

    case 'SET_SIGNUP_FIELD':
      return { ...state, signupForm: { ...state.signupForm, [action.field]: action.value } };

    case 'AUTH_SUBMITTING':
      return { ...state, authSubmitting: true, authError: null };

    case 'AUTH_ERROR':
      return { ...state, authSubmitting: false, authError: action.error };

    case 'AUTH_SUBMIT_DONE':
      return { ...state, authSubmitting: false, authError: null };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        authSubmitting: false,
        authError: null,
        session: action.user,
        accountType: action.user.accountType || 'persona',
        screen: 'home',
      };

    case 'SKIP_AUTH':
      return { ...state, screen: 'home' };

    case 'SET_HOME_CATEGORY':
      return { ...state, homeCategory: action.category };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.query };

    case 'SET_SEARCH_CATEGORY':
      return { ...state, searchCategory: action.category };

    case 'TOGGLE_BANK_ONLY':
      return { ...state, bankOnly: !state.bankOnly };

    case 'OPEN_DETAIL':
      return { ...state, screen: 'detail', selectedId: action.id };

    case 'OPEN_BUSINESS':
      return { ...state, screen: 'business', selectedBusinessId: action.id };

    case 'TOGGLE_FAV': {
      const has = state.favorites.includes(action.id);
      return { ...state, favorites: has ? state.favorites.filter((id) => id !== action.id) : [...state.favorites, action.id] };
    }

    case 'SET_FAVORITES':
      return { ...state, favorites: action.favorites };

    case 'PROFILE_UPDATED':
      return { ...state, authSubmitting: false, authError: null, session: { ...state.session, ...action.user } };

    case 'SET_DRAFT_FIELD':
      return { ...state, draft: { ...state.draft, [action.field]: action.value }, draftJustPublished: false };

    case 'PUBLISH_SUCCESS':
      return {
        ...state,
        publishedPromos: [action.promo, ...state.publishedPromos],
        promos: [action.promo, ...state.promos],
        draft: { businessName: '', category: 'Gastronomía', discountLabel: '', expiry: '', startsAt: '', redemptionLimit: '', businessHours: '', description: '' },
        draftJustPublished: true,
      };

    case 'GEO_LOADING':
      return { ...state, geoStatus: 'loading' };

    case 'GEO_GRANTED':
      return { ...state, geoStatus: 'granted', coords: action.coords };

    case 'GEO_DENIED':
      return { ...state, geoStatus: 'denied' };

    case 'LOGOUT':
      return { ...initialState, screen: 'login', promos: state.promos, promosLoading: false };

    case 'PROMOS_LOADING':
      return { ...state, promosLoading: true, promosError: null };

    case 'PROMOS_LOADED':
      return { ...state, promosLoading: false, promos: action.promos };

    case 'PROMOS_ERROR':
      return { ...state, promosLoading: false, promosError: action.error };

    default:
      return state;
  }
}
