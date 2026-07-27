import { isSupabaseConfigured, supabase } from './supabaseClient';

export async function fetchFavoriteIds() {
  if (!isSupabaseConfigured) return [];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.from('favorites').select('promo_id').eq('user_id', user.id);
  if (error) throw new Error(error.message);
  return data.map((row) => row.promo_id);
}

export async function addFavorite(promoId) {
  if (!isSupabaseConfigured) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('favorites').insert({ user_id: user.id, promo_id: promoId });
}

export async function removeFavorite(promoId) {
  if (!isSupabaseConfigured) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('favorites').delete().eq('user_id', user.id).eq('promo_id', promoId);
}
