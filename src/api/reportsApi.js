import { isSupabaseConfigured, supabase } from './supabaseClient';

export async function submitReport(targetType, targetId, reason) {
  if (!isSupabaseConfigured) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Tenés que iniciar sesión para reportar contenido.');
  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    target_type: targetType,
    target_id: targetId,
    reason,
  });
  if (error) throw new Error(error.message);
}
