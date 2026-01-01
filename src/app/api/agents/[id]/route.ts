import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticate } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { canEditPersona } from '@/lib/auth/permissions';
import { forbidden, notFound, unauthorized, validationError } from '@/lib/api/responses';

const UpdateAgentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional()
});

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  const { id } = await context.params;
  const agent = await prisma.agent.findUnique({ where: { id } });
  if (!agent) {
    return notFound('Agent not found');
  }

  const canEdit = await canEditPersona(user.id, agent.personaId);
  if (!canEdit) {
    return forbidden();
  }

  const body = await request.json();
  const parsed = UpdateAgentSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const updated = await prisma.agent.update({
    where: { id },
    data: parsed.data
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  const { id } = await context.params;
  const agent = await prisma.agent.findUnique({ where: { id } });
  if (!agent) {
    return notFound('Agent not found');
  }

  const canEdit = await canEditPersona(user.id, agent.personaId);
  if (!canEdit) {
    return forbidden();
  }

  await prisma.agent.delete({ where: { id } });
  return NextResponse.json({ message: 'Agent deleted successfully' });
}
