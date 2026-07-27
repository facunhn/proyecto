import { describe, it, expect } from 'vitest';
import { reducer, initialState } from './reducer';

describe('reducer', () => {
  it('toggles a favorite on and off', () => {
    const afterAdd = reducer(initialState, { type: 'TOGGLE_FAV', id: 3 });
    expect(afterAdd.favorites).toEqual([3]);

    const afterRemove = reducer(afterAdd, { type: 'TOGGLE_FAV', id: 3 });
    expect(afterRemove.favorites).toEqual([]);
  });

  it('logs in and switches account type from the user response', () => {
    const next = reducer(initialState, {
      type: 'AUTH_SUCCESS',
      user: { id: '1', email: 'a@b.com', accountType: 'negocio' },
    });
    expect(next.screen).toBe('home');
    expect(next.accountType).toBe('negocio');
    expect(next.authSubmitting).toBe(false);
  });

  it('sends the user back to home when switching off "negocio" while on the publish screen', () => {
    const negocioOnPublish = { ...initialState, accountType: 'negocio', screen: 'publish' };
    const next = reducer(negocioOnPublish, { type: 'TOGGLE_ACCOUNT' });
    expect(next.accountType).toBe('persona');
    expect(next.screen).toBe('home');
  });

  it('keeps the current screen when switching to "negocio"', () => {
    const personaOnFavorites = { ...initialState, accountType: 'persona', screen: 'favorites' };
    const next = reducer(personaOnFavorites, { type: 'TOGGLE_ACCOUNT' });
    expect(next.accountType).toBe('negocio');
    expect(next.screen).toBe('favorites');
  });

  it('adds a published promo to both publishedPromos and promos, and resets the draft', () => {
    const draftedState = { ...initialState, draft: { businessName: 'Café Test', category: 'Gastronomía', discountLabel: '15% OFF', expiry: '', description: '' } };
    const promo = { id: 99, business: 'Café Test', category: 'Gastronomía', discountLabel: '15% OFF' };
    const next = reducer(draftedState, { type: 'PUBLISH_SUCCESS', promo });

    expect(next.publishedPromos[0]).toEqual(promo);
    expect(next.promos[0]).toEqual(promo);
    expect(next.draftJustPublished).toBe(true);
    expect(next.draft.businessName).toBe('');
  });

  it('keeps the loaded promos when logging out, but resets everything else', () => {
    const loggedInState = { ...initialState, screen: 'home', favorites: [1, 2], promos: [{ id: 1 }], promosLoading: false };
    const next = reducer(loggedInState, { type: 'LOGOUT' });

    expect(next.screen).toBe('login');
    expect(next.favorites).toEqual([]);
    expect(next.promos).toEqual([{ id: 1 }]);
  });

  it('stores the geolocation error state without crashing', () => {
    const next = reducer(initialState, { type: 'GEO_DENIED' });
    expect(next.geoStatus).toBe('denied');
  });

  it('returns the same state for an unknown action', () => {
    const next = reducer(initialState, { type: 'NOT_A_REAL_ACTION' });
    expect(next).toBe(initialState);
  });

  it('replaces favorites wholesale when they are loaded from the backend', () => {
    const stateWithLocalFavs = { ...initialState, favorites: [1] };
    const next = reducer(stateWithLocalFavs, { type: 'SET_FAVORITES', favorites: [5, 8] });
    expect(next.favorites).toEqual([5, 8]);
  });

  it('merges profile edits into the existing session without touching the screen or account type', () => {
    const loggedInState = {
      ...initialState,
      screen: 'editProfile',
      accountType: 'negocio',
      session: { id: '1', email: 'a@b.com', name: 'Old Name', accountType: 'negocio', phone: '' },
    };
    const next = reducer(loggedInState, { type: 'PROFILE_UPDATED', user: { name: 'New Name', phone: '11 5555-5555' } });

    expect(next.session).toEqual({ id: '1', email: 'a@b.com', name: 'New Name', accountType: 'negocio', phone: '11 5555-5555' });
    expect(next.screen).toBe('editProfile');
    expect(next.accountType).toBe('negocio');
    expect(next.authSubmitting).toBe(false);
  });
});
