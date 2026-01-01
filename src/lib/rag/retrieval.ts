import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { generateEmbedding } from './embedding';

type RagSearchRow = {
  chunk_id: string;
  document_id: string;
  document_name: string | null;
  text: string;
  similarity: number;
  metadata: Prisma.JsonValue | null;
  is_curated: boolean;
};

export async function searchRag(
  personaId: string,
  query: string,
  limit = 5,
  preferCurated = true
) {
  const embedding = await generateEmbedding(query);
  const vectorLiteral = `[${embedding.join(',')}]`;

  try {
    const curatedOrder = preferCurated ? Prisma.sql`curated_boost DESC,` : Prisma.sql``;
    const rows = await prisma.$queryRaw<RagSearchRow[]>`
      SELECT
        c.id AS chunk_id,
        c.document_id,
        d.name AS document_name,
        c.text,
        c.metadata,
        c.is_curated,
        1 - (c.embedding <=> ${vectorLiteral}::vector) AS similarity,
        CASE WHEN c.is_curated THEN 1 ELSE 0 END AS curated_boost
      FROM chunks c
      LEFT JOIN documents d ON d.id = c.document_id
      WHERE c.persona_id = ${personaId}
      ORDER BY ${curatedOrder} c.embedding <=> ${vectorLiteral}::vector
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      chunkId: row.chunk_id,
      documentId: row.document_id,
      documentName: row.document_name,
      text: row.text,
      similarity: Number(row.similarity),
      metadata: row.metadata,
      isCurated: row.is_curated
    }));
  } catch (error) {
    const fallback = await prisma.chunk.findMany({
      where: {
        personaId,
        ...(query
          ? { text: { contains: query, mode: 'insensitive' as const } }
          : {})
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { document: { select: { name: true } } }
    });

    return fallback.map((chunk) => ({
      chunkId: chunk.id,
      documentId: chunk.documentId,
      documentName: chunk.document.name,
      text: chunk.text,
      similarity: 0,
      metadata: chunk.metadata as Prisma.JsonValue | null,
      isCurated: chunk.isCurated
    }));
  }
}
