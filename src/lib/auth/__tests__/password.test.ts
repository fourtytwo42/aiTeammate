import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../password';

describe('password', () => {
  it('hashes and verifies password', async () => {
    const hash = await hashPassword('secret');
    const ok = await verifyPassword('secret', hash);
    expect(ok).toBe(true);
  });
});
