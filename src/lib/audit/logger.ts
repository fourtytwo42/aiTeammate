import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

export async function logAuditEvent(data: {
  userId?: string;
  personaId?: string;
  runId?: string;
  traceId?: string;
  eventType: string;
  description: string;
  metadata?: Prisma.InputJsonValue;
  eventCategory?: 'action' | 'access' | 'error' | 'system';
}) {
  await prisma.auditEvent.create({
    data: {
      userId: data.userId,
      personaId: data.personaId,
      runId: data.runId,
      traceId: data.traceId,
      eventType: data.eventType,
      eventCategory: data.eventCategory ?? 'action',
      description: data.description,
      metadata: data.metadata ?? {}
    }
  });
}
