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
        phone: form.phone,
      },
    },
  });
  if (error) throw new Error(error.message);
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
  return { user: mapSupabaseUser(data.user) };
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
