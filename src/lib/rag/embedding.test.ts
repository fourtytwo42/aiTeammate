import { describe, expect, it } from 'vitest';
import { generateEmbedding } from './embedding';

describe('generateEmbedding', () => {
  it('returns fixed length embedding', async () => {
    const embedding = await generateEmbedding('test');
    expect(embedding).toHaveLength(1536);
  });
});
