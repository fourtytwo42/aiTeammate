import { describe, expect, it, beforeAll } from 'vitest';
import { generateRefreshToken, generateToken, verifyRefreshToken, verifyToken } from '../jwt';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
});

describe('jwt', () => {
  it('generates and verifies token', () => {
    const token = generateToken('user-123');
    const payload = verifyToken(token);
    expect(payload.userId).toBe('user-123');
  });

  it('generates and verifies refresh token', () => {
    const token = generateRefreshToken('user-456');
    const payload = verifyRefreshToken(token);
    expect(payload.userId).toBe('user-456');
  });

  it('respects custom expiry env values', () => {
    const prevAccess = process.env.JWT_EXPIRES_IN;
    const prevRefresh = process.env.JWT_REFRESH_EXPIRES_IN;

    process.env.JWT_EXPIRES_IN = '1h';
    process.env.JWT_REFRESH_EXPIRES_IN = '1h';

    const token = generateToken('user-789');
    const payload = verifyToken(token);
    expect(payload.userId).toBe('user-789');

    const refresh = generateRefreshToken('user-789');
    const refreshPayload = verifyRefreshToken(refresh);
    expect(refreshPayload.userId).toBe('user-789');

    process.env.JWT_EXPIRES_IN = prevAccess;
    process.env.JWT_REFRESH_EXPIRES_IN = prevRefresh;
  });
});
