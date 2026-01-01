export type Chunk = {
  text: string;
};

type ChunkOptions = {
  chunkSize: number;
  overlap: number;
};

export function chunkText(text: string, options: ChunkOptions): Chunk[] {
  const chunks: Chunk[] = [];
  const step = Math.max(1, options.chunkSize - options.overlap);

  for (let start = 0; start < text.length; start += step) {
    const slice = text.slice(start, start + options.chunkSize);
    if (slice.trim().length === 0) continue;
    chunks.push({ text: slice });
  }

  return chunks;
}
