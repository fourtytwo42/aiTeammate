import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticate } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { canAccessPersona, canEditPersona } from '@/lib/auth/permissions';
import { forbidden, unauthorized, validationError } from '@/lib/api/responses';

const EnableToolSchema = z.object({
  toolId: z.string().uuid(),
  config: z.record(z.string(), z.any()).optional()
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

  const tools = await prisma.personaTool.findMany({
    where: { personaId: id },
    include: { tool: true }
  });

  return NextResponse.json({
    data: tools.map((entry) => ({
      id: entry.id,
      toolId: entry.toolId,
      toolName: entry.tool.name,
      toolDescription: entry.tool.description,
      isEnabled: entry.isEnabled,
      config: entry.config
    }))
  });
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
  const parsed = EnableToolSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const entry = await prisma.personaTool.create({
    data: {
      personaId: id,
      toolId: parsed.data.toolId,
      config: parsed.data.config
    },
    include: { tool: true }
  });

  return NextResponse.json({
    id: entry.id,
    personaId: entry.personaId,
    toolId: entry.toolId,
    toolName: entry.tool.name,
    isEnabled: entry.isEnabled,
    config: entry.config,
    createdAt: entry.createdAt
  }, { status: 201 });
}
