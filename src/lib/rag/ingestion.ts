import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { chunkText } from './chunking';
import { generateEmbedding } from './embedding';

export async function ingestDocument(personaId: string, documentId: string): Promise<void> {
  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document || !document.filePath) {
    throw new Error('Document not found');
  }

  const storagePath = path.resolve(process.cwd(), document.filePath);
  const text = await fs.readFile(storagePath, 'utf-8');
  const chunks = chunkText(text, { chunkSize: 1000, overlap: 200 });

  for (const [index, chunk] of chunks.entries()) {
    const embedding = await generateEmbedding(chunk.text);
    const chunkId = crypto.randomUUID();
    const vectorLiteral = `'[${embedding.join(',')}]'::vector`;

    await prisma.$executeRaw`
      INSERT INTO chunks (id, document_id, persona_id, chunk_index, text, token_count, embedding, is_curated, created_at)
      VALUES (
        ${chunkId},
        ${document.id},
        ${personaId},
        ${index},
        ${chunk.text},
        ${chunk.text.length},
        ${Prisma.raw(vectorLiteral)},
        false,
        ${new Date()}
      )
    `;
  }

  await prisma.document.update({
    where: { id: documentId },
    data: { status: 'completed' }
  });
}
