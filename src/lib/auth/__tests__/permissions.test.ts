import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    persona: {
      findFirst: vi.fn()
    }
  }
}));

import { prisma } from '@/lib/db/prisma';
import { canAccessPersona, canEditPersona } from '../permissions';

describe('permissions', () => {
  it('allows access when persona exists', async () => {
    (prisma.persona.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: '1' });
    const allowed = await canAccessPersona('user', 'persona');
    expect(allowed).toBe(true);
  });

  it('denies access when persona missing', async () => {
    (prisma.persona.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const allowed = await canEditPersona('user', 'persona');
    expect(allowed).toBe(false);
  });
});
