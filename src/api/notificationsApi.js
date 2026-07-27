import { isSupabaseConfigured, supabase } from './supabaseClient';

export async function fetchNotifications() {
  if (!isSupabaseConfigured) return [];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function markNotificationsRead(ids) {
  if (!isSupabaseConfigured || ids.length === 0) return;
  await supabase.from('notifications').update({ read: true }).in('id', ids);
}
