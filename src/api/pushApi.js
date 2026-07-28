import { isSupabaseConfigured, supabase } from './supabaseClient';

export async function savePushSubscription(subscription) {
  if (!isSupabaseConfigured) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const json = subscription.toJSON();
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
    { onConflict: 'endpoint' },
  );
  if (error) throw new Error(error.message);
}

export async function deletePushSubscription(endpoint) {
  if (!isSupabaseConfigured || !endpoint) return;
  await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
}
