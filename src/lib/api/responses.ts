import { NextResponse } from 'next/server';

export type ErrorDetails = Record<string, string[] | string | undefined>;

export function validationError(details: ErrorDetails) {
  return NextResponse.json(
    { error: 'Validation error', code: 'VALIDATION_ERROR', details },
    { status: 400 }
  );
}

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json(
    { error: message, code: 'UNAUTHORIZED' },
    { status: 401 }
  );
}

export function forbidden(message = 'Access denied') {
  return NextResponse.json(
    { error: message, code: 'FORBIDDEN' },
    { status: 403 }
  );
}

export function notFound(message: string) {
  return NextResponse.json(
    { error: message, code: 'NOT_FOUND' },
    { status: 404 }
  );
}

export function conflict(message: string) {
  return NextResponse.json(
    { error: message, code: 'DUPLICATE_RESOURCE' },
    { status: 409 }
  );
}

export function rateLimitExceeded(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: 'Rate limit exceeded', code: 'RATE_LIMIT_EXCEEDED', retryAfter: retryAfterSeconds },
    { status: 429 }
  );
}
