import { prisma } from '@/lib/db/prisma';
import { publishRunCompleted, publishRunUpdate } from '@/lib/ws/publisher';

export async function executeRun(runId: string): Promise<void> {
  const run = await prisma.run.findUnique({ where: { id: runId } });
  if (!run) throw new Error('Run not found');

  await prisma.run.update({
    where: { id: runId },
    data: { status: 'running', startedAt: new Date() }
  });
  publishRunUpdate({ runId, status: 'running' });

  await prisma.run.update({
    where: { id: runId },
    data: { status: 'completed', output: 'Run completed', completedAt: new Date() }
  });
  publishRunCompleted({ runId, status: 'completed', output: 'Run completed' });
}
