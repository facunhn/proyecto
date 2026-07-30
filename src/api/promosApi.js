import { delay } from './client';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import { MOCK_PROMOS } from './mockData';
import { formatShortDate, todayIso } from '../utils/date';

let mockPromos = [...MOCK_PROMOS];
let nextMockId = mockPromos.length + 1;

function mapRow(row) {
  return {
    id: row.id,
    business: row.business,
    category: row.category,
    discountLabel: row.discount_label,
    description: row.description,
    expiry: row.expires_at ? formatShortDate(row.expires_at) : row.expiry || '',
    expiresAt: row.expires_at || null,
    startsAt: row.starts_at || null,
    redemptionLimit: row.redemption_limit ?? null,
    businessHours: row.business_hours || '',
    ownerId: row.owner_id || null,
    photoUrls: row.photo_urls && row.photo_urls.length ? row.photo_urls : row.image_url ? [row.image_url] : [],
    photoPaths: row.photo_paths && row.photo_paths.length ? row.photo_paths : row.image_path ? [row.image_path] : [],
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

function friendlyError(error) {
  if (error.code === '42501' || /row-level security/i.test(error.message)) {
    return new Error('Necesitás una cuenta de negocio para publicar o editar promociones.');
  }
  return new Error(error.message);
}

async function uploadPromoPhotos(files, userId) {
  const uploaded = await Promise.all(
    files.map(async (file) => {
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
      const { error } = await supabase.storage.from('promo-photos').upload(path, file);
      if (error) throw new Error(error.message);
      const {
        data: { publicUrl },
      } = supabase.storage.from('promo-photos').getPublicUrl(path);
      return { imageUrl: publicUrl, imagePath: path };
    }),
  );
  return { imageUrls: uploaded.map((u) => u.imageUrl), imagePaths: uploaded.map((u) => u.imagePath) };
}

async function removePromoPhotos(paths) {
  if (!paths || paths.length === 0) return;
  await supabase.storage.from('promo-photos').remove(paths).catch(() => {});
}

function draftToRow(draft) {
  const isBank = draft.category === 'Bancos';
  return {
    business: draft.businessName,
    category: draft.category,
    discount_label: draft.discountLabel,
    description: draft.description,
    expires_at: draft.expiry || null,
    starts_at: draft.startsAt || null,
    redemption_limit: draft.redemptionLimit ? parseInt(draft.redemptionLimit, 10) : null,
    business_hours: draft.businessHours || null,
    is_bank: isBank,
    redeem_hint: isBank ? 'Pagar con tarjeta adherida' : 'Mostrar código en caja',
  };
}

const PROMOS_CACHE_KEY = 'ahorrix-promos-cache';

export async function fetchPromos() {
  if (!isSupabaseConfigured) {
    await delay();
    return mockPromos;
  }
  try {
    const { data, error } = await supabase
      .from('promos')
      .select('*')
      .or(`expires_at.is.null,expires_at.gte.${todayIso()}`)
      .or(`starts_at.is.null,starts_at.lte.${todayIso()}`)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    const promos = data.map(mapRow);
    localStorage.setItem(PROMOS_CACHE_KEY, JSON.stringify(promos));
    return promos;
  } catch (error) {
    const cached = localStorage.getItem(PROMOS_CACHE_KEY);
    if (cached) return JSON.parse(cached);
    throw error;
  }
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

export async function fetchMyPromoStats() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.rpc('get_my_promo_stats');
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchMyPromoTimeseries() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.rpc('get_my_promo_timeseries');
  if (error) throw new Error(error.message);
  return data;
}

export async function publishPromo(draft, photoFiles = []) {
  if (!isSupabaseConfigured) {
    await delay(300);
    const promo = {
      id: nextMockId++,
      business: draft.businessName,
      category: draft.category,
      discountLabel: draft.discountLabel,
      description: draft.description,
      expiry: draft.expiry,
      startsAt: draft.startsAt || null,
      redemptionLimit: draft.redemptionLimit || null,
      distance: '0.0 km',
      isBank: draft.category === 'Bancos',
      code: draft.businessName.slice(0, 4).toUpperCase() + Math.floor(Math.random() * 1000),
      redeemHint: 'Mostrar código en caja',
      dLat: 0,
      dLon: 0,
      photoUrls: photoFiles.map((f) => URL.createObjectURL(f)),
      imageUrl: photoFiles[0] ? URL.createObjectURL(photoFiles[0]) : null,
    };
    mockPromos = [promo, ...mockPromos];
    return promo;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Tenés que iniciar sesión con una cuenta de negocio para publicar.');

  let photoFields = { imageUrls: [], imagePaths: [] };
  if (photoFiles.length) photoFields = await uploadPromoPhotos(photoFiles, user.id);

  const { data, error } = await supabase
    .from('promos')
    .insert({
      ...draftToRow(draft),
      code: draft.businessName.slice(0, 4).toUpperCase() + Math.floor(Math.random() * 1000),
      owner_id: user.id,
      photo_urls: photoFields.imageUrls,
      photo_paths: photoFields.imagePaths,
      image_url: photoFields.imageUrls[0] || null,
      image_path: photoFields.imagePaths[0] || null,
    })
    .select()
    .single();
  if (error) {
    await removePromoPhotos(photoFields.imagePaths);
    throw friendlyError(error);
  }
  return mapRow(data);
}

export async function updatePromo(id, draft, photoFiles = []) {
  if (!isSupabaseConfigured) {
    await delay(300);
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Tenés que iniciar sesión para editar tus promociones.');

  let oldImagePaths = [];
  let photoFields = { imageUrls: [], imagePaths: [] };
  if (photoFiles.length) {
    const { data: existing } = await supabase.from('promos').select('photo_paths').eq('id', id).single();
    oldImagePaths = existing?.photo_paths || [];
    photoFields = await uploadPromoPhotos(photoFiles, user.id);
  }

  const { data, error } = await supabase
    .from('promos')
    .update({
      ...draftToRow(draft),
      ...(photoFields.imageUrls.length
        ? {
            photo_urls: photoFields.imageUrls,
            photo_paths: photoFields.imagePaths,
            image_url: photoFields.imageUrls[0] || null,
            image_path: photoFields.imagePaths[0] || null,
          }
        : {}),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) {
    await removePromoPhotos(photoFields.imagePaths);
    throw friendlyError(error);
  }

  if (oldImagePaths.length) await removePromoPhotos(oldImagePaths);
  return mapRow(data);
}

export async function deletePromo(id) {
  if (!isSupabaseConfigured) return;
  const { data: existing } = await supabase.from('promos').select('photo_paths').eq('id', id).single();
  const { error } = await supabase.from('promos').delete().eq('id', id);
  if (error) throw friendlyError(error);
  await removePromoPhotos(existing?.photo_paths);
}

export async function deleteAllMyPromoPhotos() {
  if (!isSupabaseConfigured) return;
  const mine = await fetchMyPromos();
  await Promise.all(mine.filter((p) => p.photoPaths?.length).map((p) => removePromoPhotos(p.photoPaths)));
}
