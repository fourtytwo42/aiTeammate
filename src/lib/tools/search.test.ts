import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    tool: {
      findMany: vi.fn()
    }
  }
}));

import { prisma } from '@/lib/db/prisma';
import { searchTools } from './search';

describe('searchTools', () => {
  it('returns tool results with similarity placeholder', async () => {
    (prisma.tool.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: '1', name: 'tool', description: 'desc', category: 'cat' }
    ]);

    const results = await searchTools('tool', 5);
    expect(results[0]).toMatchObject({ id: '1', similarity: 0 });
  });
});
