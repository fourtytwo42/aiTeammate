import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { forbidden, notFound, unauthorized } from '@/lib/api/responses';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; memberId: string }> }
) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  const { id, memberId } = await context.params;
  const persona = await prisma.persona.findUnique({ where: { id } });
  if (!persona) {
    return notFound('Persona not found');
  }

  if (persona.ownerId !== user.id) {
    return forbidden();
  }

  await prisma.personaMember.delete({ where: { id: memberId } });
  return NextResponse.json({ message: 'Member removed successfully' });
}
