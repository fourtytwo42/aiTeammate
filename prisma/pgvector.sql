CREATE EXTENSION IF NOT EXISTS vector;

-- Tool description embedding index
CREATE INDEX IF NOT EXISTS idx_tools_description_embedding ON tools USING hnsw (description_embedding vector_cosine_ops);

-- Chunk embedding index
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON chunks USING hnsw (embedding vector_cosine_ops);
