import { USE_MOCKS, delay, request } from './client';

export async function login({ email, password }) {
  if (USE_MOCKS) {
    await delay(300);
    return { user: { id: 'mock-user', email, name: '', accountType: 'persona' } };
  }
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function signup(form) {
  if (USE_MOCKS) {
    await delay(300);
    return { user: { id: 'mock-user', email: form.email, name: form.name, accountType: form.accountType } };
  }
  return request('/auth/signup', { method: 'POST', body: JSON.stringify(form) });
}
