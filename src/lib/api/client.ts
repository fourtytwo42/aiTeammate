'use client';

import { clearTokens, getAuthHeader } from '@/lib/auth/client';

export type ApiError = {
  error: string;
  code?: string;
  details?: Record<string, string[] | string>;
};

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const bypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === '1';
  const headers = new Headers(options.headers || {});
  const authHeader = getAuthHeader();
  Object.entries(authHeader).forEach(([key, value]) => headers.set(key, value));

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(path.startsWith('/api') ? path : `/api${path}`, {
    ...options,
    headers
  });

  if (response.status === 401 && !bypass) {
    clearTokens();
    if (typeof window !== 'undefined') {
      window.location.assign('/login');
    }
  }

  const data = (await response.json().catch(() => ({}))) as T | ApiError;
  if (!response.ok) {
    const error = data as ApiError;
    throw new Error(error.error || 'Request failed');
  }

  return data as T;
}
