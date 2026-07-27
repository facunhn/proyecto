import { describe, it, expect } from 'vitest';
import { haversineKm, decoratePromos } from './promos';
import { BASE_LAT, BASE_LON } from '../api/mockData';

describe('haversineKm', () => {
  it('returns 0 for the same point', () => {
    expect(haversineKm(BASE_LAT, BASE_LON, BASE_LAT, BASE_LON)).toBeCloseTo(0, 5);
  });

  it('returns a bigger distance for points further apart', () => {
    const near = haversineKm(BASE_LAT, BASE_LON, BASE_LAT + 0.01, BASE_LON + 0.01);
    const far = haversineKm(BASE_LAT, BASE_LON, BASE_LAT + 0.1, BASE_LON + 0.1);
    expect(far).toBeGreaterThan(near);
  });
});

describe('decoratePromos', () => {
  const promos = [
    { id: 1, business: 'Panadería', isBank: false, distance: '2.0 km', dLat: 0.01, dLon: 0.01 },
    { id: 2, business: 'Banco Andes', isBank: true, distance: 'Online' },
    { id: 3, business: 'Farmacia', isBank: false, distance: '0.5 km', dLat: 0.001, dLon: 0.001 },
  ];

  it('marks favorited promos and keeps the rest as not favorited', () => {
    const decorated = decoratePromos(promos, { favorites: [2], coords: null });
    expect(decorated.find((p) => p.id === 2).isFav).toBe(true);
    expect(decorated.find((p) => p.id === 1).isFav).toBe(false);
  });

  it('labels bank promos and business promos differently', () => {
    const decorated = decoratePromos(promos, { favorites: [], coords: null });
    expect(decorated.find((p) => p.id === 2).imageLabel).toBe('LOGO BANCO');
    expect(decorated.find((p) => p.id === 1).imageLabel).toBe('FOTO DEL LOCAL');
  });

  it('keeps the static distance label when there are no coordinates', () => {
    const decorated = decoratePromos(promos, { favorites: [], coords: null });
    expect(decorated.find((p) => p.id === 1).distance).toBe('2.0 km');
  });

  it('recomputes distance from real coordinates and sorts by proximity, leaving bank promos last', () => {
    const coords = { lat: BASE_LAT, lon: BASE_LON };
    const decorated = decoratePromos(promos, { favorites: [], coords });

    expect(decorated.map((p) => p.id)).toEqual([3, 1, 2]);
    expect(decorated[0].distance).toMatch(/km$/);
  });
});
