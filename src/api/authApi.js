import { delay } from './client';
import { isSupabaseConfigured, supabase } from './supabaseClient';

function mapSupabaseUser(user) {
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email,
    name: meta.name || '',
    accountType: meta.accountType || 'persona',
    category: meta.category || '',
    address: meta.address || '',
    city: meta.city || '',
    phone: meta.phone || '',
  };
}

export async function login({ email, password }) {
  if (!isSupabaseConfigured) {
    await delay(300);
    return { user: { id: 'mock-user', email, name: '', accountType: 'persona' } };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return { user: mapSupabaseUser(data.user) };
}

export async function signup(form) {
  if (!isSupabaseConfigured) {
    await delay(300);
    return { user: { id: 'mock-user', email: form.email, name: form.name, accountType: form.accountType } };
  }
  const { data, error } = await supabase.auth.signUp({
    email: form.email,
    password: form.password,
    options: {
      data: {
        name: form.name,
        accountType: form.accountType,
        category: form.category,
        address: form.address,
        city: form.city,
        phone: form.phone,
      },
    },
  });
  if (error) throw new Error(error.message);
  // Supabase no devuelve un error acá cuando el email ya tiene cuenta (para no revelar
  // qué emails existen): en ese caso "identities" viene vacío en vez de tirar error.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    throw new Error('Ese email ya tiene una cuenta. Iniciá sesión en cambio.');
  }
  return { user: mapSupabaseUser(data.user) };
}

export async function logout() {
  if (!isSupabaseConfigured) return;
  await supabase.auth.signOut();
}

export async function requestPasswordReset(email) {
  if (!isSupabaseConfigured) {
    await delay(300);
    return;
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });
  if (error) throw new Error(error.message);
}

export async function updatePassword(password) {
  if (!isSupabaseConfigured) {
    await delay(300);
    return { user: { id: 'mock-user', email: '', name: '', accountType: 'persona' } };
  }
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
  return { user: mapSupabaseUser(data.user) };
}

export async function updateProfile(fields) {
  if (!isSupabaseConfigured) {
    await delay(300);
    return { user: { id: 'mock-user', email: '', accountType: 'persona', ...fields } };
  }
  const { data, error } = await supabase.auth.updateUser({ data: fields });
  if (error) throw new Error(error.message);
  // Refresca el token para que los permisos del backend (ej: solo negocios pueden
  // publicar) se enteren del cambio al instante, no recién en el próximo login.
  await supabase.auth.refreshSession().catch(() => {});
  return { user: mapSupabaseUser(data.user) };
}

export async function deleteAccount() {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw new Error(error.message);
  await supabase.auth.signOut();
}

export async function getSessionUser() {
  if (!isSupabaseConfigured) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ? mapSupabaseUser(session.user) : null;
}

export function onPasswordRecovery(callback) {
  if (!isSupabaseConfigured) return () => {};
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') callback();
  });
  return () => subscription.unsubscribe();
}
