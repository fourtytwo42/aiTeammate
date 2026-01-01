import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticate } from '@/lib/auth/middleware';
import { canAccessPersona } from '@/lib/auth/permissions';
import { searchRag } from '@/lib/rag/retrieval';
import { forbidden, unauthorized, validationError } from '@/lib/api/responses';

const SearchSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(25).optional()
});

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  const { id } = await context.params;
  const canAccess = await canAccessPersona(user.id, id);
  if (!canAccess) {
    return forbidden();
  }

  const body = await request.json();
  const parsed = SearchSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const results = await searchRag(id, parsed.data.query, parsed.data.limit ?? 5);
  return NextResponse.json({
    results: results.map((chunk) => ({
      chunkId: chunk.chunkId,
      documentId: chunk.documentId,
      documentName: chunk.documentName ?? null,
      text: chunk.text,
      similarity: chunk.similarity,
      metadata: chunk.metadata ?? null
    }))
  });
}
