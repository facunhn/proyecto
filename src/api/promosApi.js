import { USE_MOCKS, delay, request } from './client';
import { MOCK_PROMOS } from './mockData';

let mockPromos = [...MOCK_PROMOS];
let nextMockId = mockPromos.length + 1;

export async function fetchPromos() {
  if (USE_MOCKS) {
    await delay();
    return mockPromos;
  }
  return request('/promos');
}

export async function publishPromo(draft) {
  if (USE_MOCKS) {
    await delay(300);
    const promo = {
      id: nextMockId++,
      business: draft.businessName,
      category: draft.category,
      discountLabel: draft.discountLabel,
      description: draft.description,
      expiry: draft.expiry,
      distance: '0.0 km',
      isBank: draft.category === 'Bancos',
      code: draft.businessName.slice(0, 4).toUpperCase() + Math.floor(Math.random() * 1000),
      redeemHint: 'Mostrar código en caja',
      dLat: 0,
      dLon: 0,
    };
    mockPromos = [promo, ...mockPromos];
    return promo;
  }
  return request('/promos', { method: 'POST', body: JSON.stringify(draft) });
}
