import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { reducer, initialState } from './reducer';
import { fetchPromos, publishPromo, deleteAllMyPromoPhotos } from '../api/promosApi';
import {
  login as loginRequest,
  signup as signupRequest,
  logout as logoutRequest,
  requestPasswordReset,
  updatePassword,
  updateProfile,
  deleteAccount as deleteAccountRequest,
  getSessionUser,
  onPasswordRecovery,
} from '../api/authApi';
import { fetchFavoriteIds, addFavorite, removeFavorite } from '../api/favoritesApi';

const AppContext = createContext(null);

function loadPromos(dispatch) {
  dispatch({ type: 'PROMOS_LOADING' });
  fetchPromos()
    .then((promos) => dispatch({ type: 'PROMOS_LOADED', promos }))
    .catch((error) => dispatch({ type: 'PROMOS_ERROR', error: error.message }));
}

function afterAuthSuccess(dispatch, user) {
  dispatch({ type: 'AUTH_SUCCESS', user });
  fetchFavoriteIds()
    .then((favorites) => dispatch({ type: 'SET_FAVORITES', favorites }))
    .catch(() => {});
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const handledRedeemRef = useRef(false);
  useEffect(() => {
    if (state.promosLoading || handledRedeemRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('redeem');
    if (code) {
      handledRedeemRef.current = true;
      const match = state.promos.find((p) => p.code === code);
      if (match) dispatch({ type: 'OPEN_DETAIL', id: match.id });
      const url = new URL(window.location.href);
      url.searchParams.delete('redeem');
      window.history.replaceState({}, '', url);
    }
  }, [state.promosLoading, state.promos]);

  useEffect(() => {
    loadPromos(dispatch);
  }, []);

  useEffect(() => {
    return onPasswordRecovery(() => dispatch({ type: 'SET_SCREEN', screen: 'resetPassword' }));
  }, []);

  // Si ya había una sesión guardada (login previo), entra directo sin pedir login de nuevo.
  useEffect(() => {
    getSessionUser().then((user) => {
      if (user) afterAuthSuccess(dispatch, user);
    });
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
          afterAuthSuccess(dispatch, user);
        } catch (error) {
          dispatch({ type: 'AUTH_ERROR', error: error.message });
        }
      },

      submitSignup: async (form) => {
        dispatch({ type: 'AUTH_SUBMITTING' });
        try {
          const { user } = await signupRequest(form);
          afterAuthSuccess(dispatch, user);
        } catch (error) {
          dispatch({ type: 'AUTH_ERROR', error: error.message });
        }
      },

      skipAuth: () => dispatch({ type: 'SKIP_AUTH' }),

      setHomeCategory: (category) => dispatch({ type: 'SET_HOME_CATEGORY', category }),
      setSearchQuery: (query) => dispatch({ type: 'SET_SEARCH_QUERY', query }),
      setSearchCategory: (category) => dispatch({ type: 'SET_SEARCH_CATEGORY', category }),
      toggleBankOnly: () => dispatch({ type: 'TOGGLE_BANK_ONLY' }),

      openDetail: (id) => dispatch({ type: 'OPEN_DETAIL', id }),
      toggleFav: (id, e) => {
        if (e?.stopPropagation) e.stopPropagation();
        const wasFav = stateRef.current.favorites.includes(id);
        dispatch({ type: 'TOGGLE_FAV', id });
        if (wasFav) removeFavorite(id);
        else addFavorite(id);
      },

      setDraftField: (field, value) => dispatch({ type: 'SET_DRAFT_FIELD', field, value }),
      submitDraft: async (draft, photoFile) => {
        const promo = await publishPromo(draft, photoFile);
        dispatch({ type: 'PUBLISH_SUCCESS', promo });
        return promo;
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

      logout: () => {
        dispatch({ type: 'LOGOUT' });
        logoutRequest();
      },

      sendPasswordReset: async (email) => {
        dispatch({ type: 'AUTH_SUBMITTING' });
        try {
          await requestPasswordReset(email);
          dispatch({ type: 'AUTH_SUBMIT_DONE' });
        } catch (error) {
          dispatch({ type: 'AUTH_ERROR', error: error.message });
        }
      },

      submitPasswordReset: async (password) => {
        dispatch({ type: 'AUTH_SUBMITTING' });
        try {
          const { user } = await updatePassword(password);
          afterAuthSuccess(dispatch, user);
        } catch (error) {
          dispatch({ type: 'AUTH_ERROR', error: error.message });
        }
      },

      updateMyProfile: async (fields) => {
        dispatch({ type: 'AUTH_SUBMITTING' });
        try {
          const { user } = await updateProfile(fields);
          dispatch({ type: 'PROFILE_UPDATED', user });
          return true;
        } catch (error) {
          dispatch({ type: 'AUTH_ERROR', error: error.message });
          return false;
        }
      },

      deleteMyAccount: async () => {
        dispatch({ type: 'AUTH_SUBMITTING' });
        try {
          await deleteAllMyPromoPhotos();
          await deleteAccountRequest();
          dispatch({ type: 'LOGOUT' });
          return true;
        } catch (error) {
          dispatch({ type: 'AUTH_ERROR', error: error.message });
          return false;
        }
      },
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
