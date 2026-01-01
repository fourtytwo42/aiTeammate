import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticate } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { canAccessPersona } from '@/lib/auth/permissions';
import { generateTraceId } from '@/lib/observability/trace';
import { RunStatus } from '@prisma/client';
import { forbidden, notFound, unauthorized, validationError } from '@/lib/api/responses';

const CreateRunSchema = z.object({
  agentId: z.string().uuid(),
  input: z.string().min(1)
});

export async function GET(request: NextRequest) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  const page = Number(request.nextUrl.searchParams.get('page') ?? '1');
  const limit = Number(request.nextUrl.searchParams.get('limit') ?? '20');
  const personaId = request.nextUrl.searchParams.get('personaId');
  const agentId = request.nextUrl.searchParams.get('agentId');
  const status = request.nextUrl.searchParams.get('status');
  const skip = (page - 1) * limit;
  const statusFilter =
    status && Object.values(RunStatus).includes(status as RunStatus)
      ? (status as RunStatus)
      : undefined;

  const where = {
    userId: user.id,
    ...(personaId ? { personaId } : {}),
    ...(agentId ? { agentId } : {}),
    ...(statusFilter ? { status: statusFilter } : {})
  };

  const [total, runs] = await Promise.all([
    prisma.run.count({ where }),
    prisma.run.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { agent: true, persona: true }
    })
  ]);

  return NextResponse.json({
    data: runs.map((run) => ({
      id: run.id,
      agentId: run.agentId,
      agentName: run.agent.name,
      personaId: run.personaId,
      personaName: run.persona.name,
      status: run.status,
      input: run.input,
      output: run.output,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      createdAt: run.createdAt
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}

export async function POST(request: NextRequest) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = CreateRunSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const agent = await prisma.agent.findUnique({ where: { id: parsed.data.agentId } });
  if (!agent) {
    return notFound('Agent not found');
  }

  const canAccess = await canAccessPersona(user.id, agent.personaId);
  if (!canAccess) {
    return forbidden();
  }

  const run = await prisma.run.create({
    data: {
      agentId: agent.id,
      personaId: agent.personaId,
      userId: user.id,
      input: parsed.data.input,
      traceId: generateTraceId()
    }
  });

  return NextResponse.json({
    id: run.id,
    agentId: run.agentId,
    personaId: run.personaId,
    status: run.status,
    input: run.input,
    createdAt: run.createdAt
  }, { status: 201 });
}
