import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { notFound, unauthorized } from '@/lib/api/responses';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  const { id } = await context.params;
  const tool = await prisma.tool.findUnique({ where: { id } });
  if (!tool) {
    return notFound('Tool not found');
  }

  return NextResponse.json(tool);
}
