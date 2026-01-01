import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { unauthorized, validationError } from '@/lib/api/responses';
import { AuditEventCategory } from '@prisma/client';

export async function GET(request: NextRequest) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  const page = Number(request.nextUrl.searchParams.get('page') ?? '1');
  const limit = Number(request.nextUrl.searchParams.get('limit') ?? '50');
  const skip = (page - 1) * limit;
  const userId = request.nextUrl.searchParams.get('userId');
  const personaId = request.nextUrl.searchParams.get('personaId');
  const runId = request.nextUrl.searchParams.get('runId');
  const eventType = request.nextUrl.searchParams.get('eventType');
  const eventCategoryParam = request.nextUrl.searchParams.get('eventCategory');
  const startDate = request.nextUrl.searchParams.get('startDate');
  const endDate = request.nextUrl.searchParams.get('endDate');

  let createdAtFilter: { gte?: Date; lte?: Date } | undefined;
  if (startDate || endDate) {
    createdAtFilter = {};
    if (startDate) {
      const parsed = new Date(startDate);
      if (Number.isNaN(parsed.getTime())) {
        return validationError({ startDate: ['Invalid startDate'] });
      }
      createdAtFilter.gte = parsed;
    }
    if (endDate) {
      const parsed = new Date(endDate);
      if (Number.isNaN(parsed.getTime())) {
        return validationError({ endDate: ['Invalid endDate'] });
      }
      createdAtFilter.lte = parsed;
    }
  }

  let eventCategory: AuditEventCategory | undefined;
  if (eventCategoryParam) {
    eventCategory = Object.values(AuditEventCategory).includes(eventCategoryParam as AuditEventCategory)
      ? (eventCategoryParam as AuditEventCategory)
      : undefined;
    if (!eventCategory) {
      return validationError({ eventCategory: ['Invalid eventCategory'] });
    }
  }

  const where = {
    ...(userId ? { userId } : {}),
    ...(personaId ? { personaId } : {}),
    ...(runId ? { runId } : {}),
    ...(eventType ? { eventType } : {}),
    ...(eventCategory ? { eventCategory } : {}),
    ...(createdAtFilter ? { createdAt: createdAtFilter } : {})
  };

  const [total, events] = await Promise.all([
    prisma.auditEvent.count({ where }),
    prisma.auditEvent.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: true, persona: true }
    })
  ]);

  return NextResponse.json({
    data: events.map((event) => ({
      id: event.id,
      userId: event.userId,
      userName: event.user?.name,
      personaId: event.personaId,
      personaName: event.persona?.name,
      runId: event.runId,
      eventType: event.eventType,
      eventCategory: event.eventCategory,
      description: event.description,
      metadata: event.metadata,
      createdAt: event.createdAt
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}
