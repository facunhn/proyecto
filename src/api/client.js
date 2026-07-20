// Cuando exista un backend real, definí VITE_API_BASE_URL (ver .env.example) y
// cada módulo en src/api/ va a usar fetch() contra ese servidor en vez del mock local.
// Endpoints esperados: GET /promos, POST /promos, POST /auth/login, POST /auth/signup.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const USE_MOCKS = !API_BASE_URL;

export function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(message || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}
