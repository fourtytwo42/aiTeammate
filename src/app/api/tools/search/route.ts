import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticate } from '@/lib/auth/middleware';
import { searchTools } from '@/lib/tools/search';
import { unauthorized, validationError } from '@/lib/api/responses';

const SearchSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(25).optional()
});

export async function POST(request: NextRequest) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = SearchSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const results = await searchTools(parsed.data.query, parsed.data.limit ?? 5);
  return NextResponse.json({ results });
}
