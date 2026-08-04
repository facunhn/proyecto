import { isSupabaseConfigured, supabase } from './supabaseClient';

export async function fetchMyFollowedBusinessIds() {
  if (!isSupabaseConfigured) return [];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase.from('business_follows').select('business_id').eq('follower_id', user.id);
  if (error) throw new Error(error.message);
  return data.map((r) => r.business_id);
}

export async function followBusiness(businessId) {
  if (!isSupabaseConfigured) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Tenés que iniciar sesión para seguir un negocio.');
  const { error } = await supabase.from('business_follows').insert({ follower_id: user.id, business_id: businessId });
  if (error) throw new Error(error.message);
}

export async function unfollowBusiness(businessId) {
  if (!isSupabaseConfigured) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase.from('business_follows').delete().eq('follower_id', user.id).eq('business_id', businessId);
  if (error) throw new Error(error.message);
}
