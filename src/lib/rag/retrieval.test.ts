import { describe, expect, test, vi } from 'vitest';
import { searchRag } from './retrieval';

const prismaMock = vi.hoisted(() => ({
  $queryRaw: vi.fn(),
  chunk: {
    findMany: vi.fn()
  }
}));

vi.mock('@/lib/rag/embedding', () => ({
  generateEmbedding: vi.fn(async () => new Array(3).fill(0))
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: prismaMock
}));

describe('searchRag', () => {
  test('maps vector search results', async () => {
    prismaMock.$queryRaw.mockResolvedValue([
      {
        chunk_id: 'chunk-1',
        document_id: 'doc-1',
        document_name: 'Handbook',
        text: 'Policy text',
        similarity: 0.92,
        metadata: { page: 12 },
        is_curated: false
      }
    ]);

    const results = await searchRag('persona-1', 'policy', 5, true);
    expect(results).toEqual([
      {
        chunkId: 'chunk-1',
        documentId: 'doc-1',
        documentName: 'Handbook',
        text: 'Policy text',
        similarity: 0.92,
        metadata: { page: 12 },
        isCurated: false
      }
    ]);
  });

  test('falls back when vector search fails', async () => {
    prismaMock.$queryRaw.mockRejectedValue(new Error('vector unavailable'));
    prismaMock.chunk.findMany.mockResolvedValue([
      {
        id: 'chunk-2',
        documentId: 'doc-2',
        text: 'Fallback text',
        metadata: null,
        isCurated: true,
        document: { name: 'Fallback Doc' }
      }
    ]);

    const results = await searchRag('persona-2', 'fallback', 3, false);
    expect(results).toEqual([
      {
        chunkId: 'chunk-2',
        documentId: 'doc-2',
        documentName: 'Fallback Doc',
        text: 'Fallback text',
        similarity: 0,
        metadata: null,
        isCurated: true
      }
    ]);
  });
});
