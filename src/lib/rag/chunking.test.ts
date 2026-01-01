import { describe, expect, it } from 'vitest';
import { chunkText } from './chunking';

describe('chunkText', () => {
  it('splits text into chunks', () => {
    const chunks = chunkText('hello world', { chunkSize: 5, overlap: 0 });
    expect(chunks.length).toBeGreaterThan(1);
  });

  it('skips empty chunks', () => {
    const chunks = chunkText('   ', { chunkSize: 2, overlap: 0 });
    expect(chunks.length).toBe(0);
  });
});
