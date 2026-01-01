import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticate } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { canEditPersona } from '@/lib/auth/permissions';
import { forbidden, unauthorized, validationError } from '@/lib/api/responses';

const UpdateToolSchema = z.object({
  isEnabled: z.boolean().optional(),
  config: z.record(z.string(), z.any()).optional()
});

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string; toolId: string }> }
) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  const { id, toolId } = await context.params;
  const canEdit = await canEditPersona(user.id, id);
  if (!canEdit) {
    return forbidden();
  }

  const body = await request.json();
  const parsed = UpdateToolSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const updated = await prisma.personaTool.update({
    where: {
      personaId_toolId: {
        personaId: id,
        toolId
      }
    },
    data: parsed.data,
    include: { tool: true }
  });

  return NextResponse.json({
    id: updated.id,
    personaId: updated.personaId,
    toolId: updated.toolId,
    isEnabled: updated.isEnabled,
    config: updated.config,
    updatedAt: new Date().toISOString()
  });
}
