import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { canAccessPersona } from '@/lib/auth/permissions';
import { forbidden, notFound, unauthorized } from '@/lib/api/responses';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  const { id } = await context.params;
  const run = await prisma.run.findUnique({
    where: { id },
    include: {
      agent: true,
      persona: true,
      user: true,
      steps: { orderBy: { stepNumber: 'asc' }, include: { tool: true } },
      artifacts: true
    }
  });

  if (!run) {
    return notFound('Run not found');
  }

  const canAccess = await canAccessPersona(user.id, run.personaId);
  if (!canAccess) {
    return forbidden();
  }

  return NextResponse.json({
    id: run.id,
    agentId: run.agentId,
    agentName: run.agent.name,
    personaId: run.personaId,
    personaName: run.persona.name,
    userId: run.userId,
    userName: run.user.name,
    traceId: run.traceId,
    status: run.status,
    input: run.input,
    output: run.output,
    errorMessage: run.errorMessage,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    createdAt: run.createdAt,
    steps: run.steps.map((step) => ({
      id: step.id,
      stepNumber: step.stepNumber,
      stepType: step.stepType,
      toolId: step.toolId,
      toolName: step.tool?.name ?? null,
      input: step.input,
      output: step.output,
      durationMs: step.durationMs,
      createdAt: step.createdAt
    })),
    artifacts: run.artifacts.map((artifact) => ({
      id: artifact.id,
      name: artifact.name,
      filePath: artifact.filePath,
      fileSize: Number(artifact.fileSize),
      mimeType: artifact.mimeType,
      createdAt: artifact.createdAt
    }))
  });
}
