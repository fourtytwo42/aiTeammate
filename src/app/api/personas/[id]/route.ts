import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticate } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { canAccessPersona, canEditPersona } from '@/lib/auth/permissions';
import { forbidden, notFound, unauthorized, validationError } from '@/lib/api/responses';

const UpdatePersonaSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  systemPrompt: z.string().min(1).optional(),
  defaultProvider: z.string().optional(),
  fallbackProviders: z.array(z.string()).optional()
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

  const persona = await prisma.persona.findUnique({
    where: { id },
    include: { owner: true, agents: true }
  });

  if (!persona) {
    return notFound('Persona not found');
  }

  return NextResponse.json({
    id: persona.id,
    name: persona.name,
    description: persona.description,
    systemPrompt: persona.systemPrompt,
    ownerId: persona.ownerId,
    ownerName: persona.owner.name,
    defaultProvider: persona.defaultProvider,
    fallbackProviders: persona.fallbackProviders,
    isActive: persona.isActive,
    containerId: persona.containerId,
    agents: persona.agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      isActive: agent.isActive
    })),
    createdAt: persona.createdAt,
    updatedAt: persona.updatedAt
  });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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
  const parsed = UpdatePersonaSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const persona = await prisma.persona.update({
    where: { id },
    data: parsed.data
  });

  return NextResponse.json(persona);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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

  await prisma.persona.delete({ where: { id } });
  return NextResponse.json({ message: 'Persona deleted successfully' });
}
