import { isSupabaseConfigured, supabase } from './supabaseClient';

export async function recordRedemption(promoId) {
  if (!isSupabaseConfigured) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase.from('redemptions').insert({ user_id: user.id, promo_id: promoId });
  if (error) {
    if (/redemption_limit_reached/.test(error.message)) {
      throw new Error('Ya alcanzaste el límite de canjes que el negocio permite para esta promoción.');
    }
    throw new Error(error.message);
  }
}

export async function fetchRedemptions() {
  if (!isSupabaseConfigured) return [];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('redemptions')
    .select('id, redeemed_at, promos(business, discount_label, category)')
    .eq('user_id', user.id)
    .order('redeemed_at', { ascending: false });
  if (error) throw new Error(error.message);

  return data.map((row) => ({
    id: row.id,
    redeemedAt: row.redeemed_at,
    business: row.promos?.business || 'Promoción eliminada',
    discountLabel: row.promos?.discount_label || '',
    category: row.promos?.category || '',
  }));
}
