import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { reducer, initialState } from './reducer';
import { fetchPromos, publishPromo } from '../api/promosApi';
import { login as loginRequest, signup as signupRequest } from '../api/authApi';

const AppContext = createContext(null);

function loadPromos(dispatch) {
  dispatch({ type: 'PROMOS_LOADING' });
  fetchPromos()
    .then((promos) => dispatch({ type: 'PROMOS_LOADED', promos }))
    .catch((error) => dispatch({ type: 'PROMOS_ERROR', error: error.message }));
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    loadPromos(dispatch);
  }, []);

  const actions = useMemo(
    () => ({
      retryLoadPromos: () => loadPromos(dispatch),

      goTo: (screen) => dispatch({ type: 'SET_SCREEN', screen }),
      goHome: () => dispatch({ type: 'SET_SCREEN', screen: 'home' }),

      setLoginField: (field, value) => dispatch({ type: 'SET_LOGIN_FIELD', field, value }),
      setSignupField: (field, value) => dispatch({ type: 'SET_SIGNUP_FIELD', field, value }),

      submitLogin: async (email, password) => {
        dispatch({ type: 'AUTH_SUBMITTING' });
        try {
          const { user } = await loginRequest({ email, password });
          dispatch({ type: 'AUTH_SUCCESS', user });
        } catch (error) {
          dispatch({ type: 'AUTH_ERROR', error: error.message });
        }
      },

      submitSignup: async (form) => {
        dispatch({ type: 'AUTH_SUBMITTING' });
        try {
          const { user } = await signupRequest(form);
          dispatch({ type: 'AUTH_SUCCESS', user });
        } catch (error) {
          dispatch({ type: 'AUTH_ERROR', error: error.message });
        }
      },

      skipAuth: () => dispatch({ type: 'SKIP_AUTH' }),
      toggleAccount: () => dispatch({ type: 'TOGGLE_ACCOUNT' }),

      setHomeCategory: (category) => dispatch({ type: 'SET_HOME_CATEGORY', category }),
      setSearchQuery: (query) => dispatch({ type: 'SET_SEARCH_QUERY', query }),
      setSearchCategory: (category) => dispatch({ type: 'SET_SEARCH_CATEGORY', category }),
      toggleBankOnly: () => dispatch({ type: 'TOGGLE_BANK_ONLY' }),

      openDetail: (id) => dispatch({ type: 'OPEN_DETAIL', id }),
      toggleFav: (id, e) => {
        if (e?.stopPropagation) e.stopPropagation();
        dispatch({ type: 'TOGGLE_FAV', id });
      },

      setDraftField: (field, value) => dispatch({ type: 'SET_DRAFT_FIELD', field, value }),
      submitDraft: async (draft) => {
        const promo = await publishPromo(draft);
        dispatch({ type: 'PUBLISH_SUCCESS', promo });
      },

      requestLocation: () => {
        if (!navigator.geolocation) {
          dispatch({ type: 'GEO_DENIED' });
          return;
        }
        dispatch({ type: 'GEO_LOADING' });
        navigator.geolocation.getCurrentPosition(
          (pos) => dispatch({ type: 'GEO_GRANTED', coords: { lat: pos.coords.latitude, lon: pos.coords.longitude } }),
          () => dispatch({ type: 'GEO_DENIED' }),
          { timeout: 8000 },
        );
      },

      logout: () => dispatch({ type: 'LOGOUT' }),
    }),
    [],
  );

  const value = useMemo(() => ({ state, ...actions }), [state, actions]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
