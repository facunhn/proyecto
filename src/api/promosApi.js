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
    imageUrl: row.image_url || null,
    imagePath: row.image_path || null,
  };
}

async function uploadPromoPhoto(file, userId) {
  const path = `${userId}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from('promo-photos').upload(path, file);
  if (error) throw new Error(error.message);
  const {
    data: { publicUrl },
  } = supabase.storage.from('promo-photos').getPublicUrl(path);
  return { imageUrl: publicUrl, imagePath: path };
}

function draftToRow(draft) {
  const isBank = draft.category === 'Bancos';
  return {
    business: draft.businessName,
    category: draft.category,
    discount_label: draft.discountLabel,
    description: draft.description,
    expiry: draft.expiry,
    is_bank: isBank,
    redeem_hint: isBank ? 'Pagar con tarjeta adherida' : 'Mostrar código en caja',
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

export async function fetchMyPromos() {
  if (!isSupabaseConfigured) {
    await delay();
    return [];
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('promos')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data.map(mapRow);
}

export async function publishPromo(draft, photoFile) {
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
      imageUrl: photoFile ? URL.createObjectURL(photoFile) : null,
    };
    mockPromos = [promo, ...mockPromos];
    return promo;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Tenés que iniciar sesión con una cuenta de negocio para publicar.');

  let photoFields = {};
  if (photoFile) photoFields = await uploadPromoPhoto(photoFile, user.id);

  const { data, error } = await supabase
    .from('promos')
    .insert({
      ...draftToRow(draft),
      code: draft.businessName.slice(0, 4).toUpperCase() + Math.floor(Math.random() * 1000),
      owner_id: user.id,
      image_url: photoFields.imageUrl || null,
      image_path: photoFields.imagePath || null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data);
}

export async function updatePromo(id, draft, photoFile) {
  if (!isSupabaseConfigured) {
    await delay(300);
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Tenés que iniciar sesión para editar tus promociones.');

  let photoFields = {};
  if (photoFile) photoFields = await uploadPromoPhoto(photoFile, user.id);

  const { data, error } = await supabase
    .from('promos')
    .update({
      ...draftToRow(draft),
      ...photoFields.imageUrl ? { image_url: photoFields.imageUrl, image_path: photoFields.imagePath } : {},
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data);
}

export async function deletePromo(id) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('promos').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
