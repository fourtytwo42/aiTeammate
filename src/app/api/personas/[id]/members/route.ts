import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticate } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { forbidden, notFound, unauthorized, validationError } from '@/lib/api/responses';

const AddMemberSchema = z.object({
  userEmail: z.string().email(),
  role: z.enum(['editor', 'viewer']).default('editor')
});

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  const { id } = await context.params;
  const persona = await prisma.persona.findUnique({ where: { id } });
  if (!persona) {
    return notFound('Persona not found');
  }

  if (persona.ownerId !== user.id) {
    return forbidden();
  }

  const body = await request.json();
  const parsed = AddMemberSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const memberUser = await prisma.user.findUnique({ where: { email: parsed.data.userEmail } });
  if (!memberUser) {
    return notFound('User not found');
  }

  const member = await prisma.personaMember.create({
    data: {
      personaId: persona.id,
      userId: memberUser.id,
      role: parsed.data.role
    }
  });

  return NextResponse.json({
    id: member.id,
    personaId: member.personaId,
    userId: member.userId,
    userName: memberUser.name,
    userEmail: memberUser.email,
    role: member.role,
    createdAt: member.createdAt
  }, { status: 201 });
}
