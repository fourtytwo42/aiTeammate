import { NextRequest, NextResponse } from 'next/server';
import { rateLimitExceeded } from '@/lib/api/responses';

type RateLimitState = {
  count: number;
  resetAt: number;
};

const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000);
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 100);
const storeKey = '__personaRateLimitStore__';

function getStore(): Map<string, RateLimitState> {
  const globalStore = globalThis as typeof globalThis & { [storeKey]?: Map<string, RateLimitState> };
  if (!globalStore[storeKey]) {
    globalStore[storeKey] = new Map<string, RateLimitState>();
  }
  return globalStore[storeKey];
}

function getRateKey(request: NextRequest): string {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
  if (token) {
    return `token:${token}`;
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() ?? request.ip ?? 'unknown';
  return `ip:${ip}`;
}

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  if (!rateLimitMax || !rateLimitWindowMs) {
    return NextResponse.next();
  }

  const store = getStore();
  const key = getRateKey(request);
  const now = Date.now();
  const state = store.get(key);

  let nextState = state;
  if (!nextState || now >= nextState.resetAt) {
    nextState = { count: 0, resetAt: now + rateLimitWindowMs };
  }

  nextState.count += 1;
  store.set(key, nextState);

  const remaining = Math.max(rateLimitMax - nextState.count, 0);
  const resetSeconds = Math.ceil((nextState.resetAt - now) / 1000);

  if (nextState.count > rateLimitMax) {
    const response = rateLimitExceeded(resetSeconds);
    response.headers.set('X-RateLimit-Limit', String(rateLimitMax));
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', String(resetSeconds));
    return response;
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(rateLimitMax));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', String(resetSeconds));
  return response;
}

export const config = {
  matcher: ['/api/:path*']
};
