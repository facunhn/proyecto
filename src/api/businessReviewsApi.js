import { isSupabaseConfigured, supabase } from './supabaseClient';

export async function fetchBusinessReviews(businessId) {
  if (!isSupabaseConfigured) return { reviews: [], average: 0 };
  const { data, error } = await supabase
    .from('business_reviews')
    .select('id, rating, comment, created_at, reviewer_id')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  const average = data.length ? data.reduce((sum, r) => sum + r.rating, 0) / data.length : 0;
  return { reviews: data, average };
}

export async function fetchMyReviewFor(businessId) {
  if (!isSupabaseConfigured) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('business_reviews')
    .select('rating, comment')
    .eq('business_id', businessId)
    .eq('reviewer_id', user.id)
    .maybeSingle();
  return data;
}

export async function submitBusinessReview(businessId, rating, comment) {
  if (!isSupabaseConfigured) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Tenés que iniciar sesión para dejar una reseña.');
  const { error } = await supabase
    .from('business_reviews')
    .upsert({ business_id: businessId, reviewer_id: user.id, rating, comment }, { onConflict: 'business_id,reviewer_id' });
  if (error) throw new Error(error.message);
}
