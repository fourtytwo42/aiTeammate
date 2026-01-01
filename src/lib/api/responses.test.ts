import { describe, expect, test } from 'vitest';
import { rateLimitExceeded, unauthorized, validationError } from './responses';

describe('api responses', () => {
  test('validationError includes code and details', async () => {
    const response = validationError({ email: ['Required'] });
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.details.email).toEqual(['Required']);
  });

  test('unauthorized includes code', async () => {
    const response = unauthorized();
    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body.code).toBe('UNAUTHORIZED');
  });

  test('rateLimitExceeded includes retryAfter', async () => {
    const response = rateLimitExceeded(30);
    expect(response.status).toBe(429);

    const body = await response.json();
    expect(body.code).toBe('RATE_LIMIT_EXCEEDED');
    expect(body.retryAfter).toBe(30);
  });
});
