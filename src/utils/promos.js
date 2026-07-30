import { BASE_LAT, BASE_LON } from '../api/mockData';

export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

export function decoratePromos(promos, { favorites, coords }) {
  const decorated = promos.map((p) => {
    let distance = p.distance;
    let distanceKm = p.isBank ? Infinity : parseFloat(p.distance);
    if (!p.isBank && coords) {
      distanceKm = haversineKm(coords.lat, coords.lon, BASE_LAT + (p.dLat ?? 0), BASE_LON + (p.dLon ?? 0));
      distance = `${distanceKm.toFixed(1)} km`;
    }
    return {
      ...p,
      distance,
      distanceKm,
      isFav: favorites.includes(p.id),
      imageLabel: p.isBank ? 'LOGO BANCO' : 'FOTO DEL LOCAL',
    };
  });
  if (coords) decorated.sort((a, b) => a.distanceKm - b.distanceKm);
  return decorated;
}

export function parseDiscountValue(label) {
  const match = /(\d+(?:[.,]\d+)?)/.exec(label || '');
  return match ? parseFloat(match[1].replace(',', '.')) : 0;
}

export function sortPromos(promos, sortBy) {
  const list = [...promos];
  if (sortBy === 'descuento') {
    list.sort((a, b) => parseDiscountValue(b.discountLabel) - parseDiscountValue(a.discountLabel));
  } else if (sortBy === 'vencimiento') {
    list.sort((a, b) => {
      if (!a.expiresAt && !b.expiresAt) return 0;
      if (!a.expiresAt) return 1;
      if (!b.expiresAt) return -1;
      return a.expiresAt.localeCompare(b.expiresAt);
    });
  } else {
    list.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }
  return list;
}
