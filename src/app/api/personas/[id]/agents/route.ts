import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticate } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { canAccessPersona, canEditPersona } from '@/lib/auth/permissions';
import { forbidden, unauthorized, validationError } from '@/lib/api/responses';

const CreateAgentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  systemPromptOverride: z.string().optional(),
  preferredProvider: z.string().optional()
});

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  const { id } = await context.params;
  const canAccess = await canAccessPersona(user.id, id);
  if (!canAccess) {
    return forbidden();
  }

  const agents = await prisma.agent.findMany({
    where: { personaId: id },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ data: agents });
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  const { id } = await context.params;
  const canEdit = await canEditPersona(user.id, id);
  if (!canEdit) {
    return forbidden();
  }

  const body = await request.json();
  const parsed = CreateAgentSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const agent = await prisma.agent.create({
    data: {
      personaId: id,
      name: parsed.data.name,
      description: parsed.data.description,
      systemPromptOverride: parsed.data.systemPromptOverride,
      preferredProvider: parsed.data.preferredProvider
    }
  });

  return NextResponse.json(agent, { status: 201 });
}
