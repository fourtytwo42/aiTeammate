'use client';

const TOKEN_KEY = 'persona_token';
const REFRESH_KEY = 'persona_refresh_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function setRefreshToken(token: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(REFRESH_KEY, token);
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}

export function getAuthHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
