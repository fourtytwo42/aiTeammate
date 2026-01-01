import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { canAccessPersona } from '@/lib/auth/permissions';
import { forbidden, notFound, unauthorized } from '@/lib/api/responses';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  const { id } = await context.params;
  const run = await prisma.run.findUnique({ where: { id } });
  if (!run) {
    return notFound('Run not found');
  }

  const canAccess = await canAccessPersona(user.id, run.personaId);
  if (!canAccess) {
    return forbidden();
  }

  const updated = await prisma.run.update({
    where: { id },
    data: { status: 'cancelled' }
  });

  return NextResponse.json(updated);
}
