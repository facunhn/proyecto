import { delay } from './client';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import { MOCK_PROMOS } from './mockData';

let mockPromos = [...MOCK_PROMOS];
let nextMockId = mockPromos.length + 1;

function mapRow(row) {
  return {
    id: row.id,
    business: row.business,
    category: row.category,
    discountLabel: row.discount_label,
    description: row.description,
    expiry: row.expiry,
    distance: row.is_bank ? 'Online' : '0.0 km',
    isBank: row.is_bank,
    code: row.code,
    redeemHint: row.redeem_hint,
    dLat: row.d_lat,
    dLon: row.d_lon,
  };
}

export async function fetchPromos() {
  if (!isSupabaseConfigured) {
    await delay();
    return mockPromos;
  }
  const { data, error } = await supabase.from('promos').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data.map(mapRow);
}

export async function publishPromo(draft) {
  if (!isSupabaseConfigured) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Tenés que iniciar sesión con una cuenta de negocio para publicar.');

  const isBank = draft.category === 'Bancos';
  const { data, error } = await supabase
    .from('promos')
    .insert({
      business: draft.businessName,
      category: draft.category,
      discount_label: draft.discountLabel,
      description: draft.description,
      expiry: draft.expiry,
      is_bank: isBank,
      code: draft.businessName.slice(0, 4).toUpperCase() + Math.floor(Math.random() * 1000),
      redeem_hint: isBank ? 'Pagar con tarjeta adherida' : 'Mostrar código en caja',
      owner_id: user.id,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data);
}
