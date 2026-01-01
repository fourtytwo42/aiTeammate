import fs from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@/lib/db/prisma';
import { logAuditEvent } from '@/lib/audit/logger';
import { publishRunCompleted, publishRunError, publishRunUpdate } from '@/lib/ws/publisher';

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function executeRun(runId: string): Promise<void> {
  const run = await prisma.run.findUnique({
    where: { id: runId },
    include: { agent: true, persona: true, user: true }
  });
  if (!run) throw new Error('Run not found');

  try {
    await prisma.run.update({
      where: { id: runId },
      data: { status: 'running', startedAt: new Date() }
    });
    await logAuditEvent({
      userId: run.userId,
      personaId: run.personaId,
      runId: run.id,
      traceId: run.traceId,
      eventType: 'run_started',
      description: `Run ${run.id} started`,
      eventCategory: 'system'
    });
    publishRunUpdate({ runId, status: 'running' });

    const stepOne = await prisma.runStep.create({
      data: {
        runId: run.id,
        stepNumber: 1,
        stepType: 'llm_call',
        input: { prompt: run.input },
        output: { summary: 'Planned task steps' },
        durationMs: 350
      }
    });
    publishRunUpdate({
      runId,
      status: 'running',
      step: {
        id: stepOne.id,
        stepNumber: stepOne.stepNumber,
        stepType: stepOne.stepType,
        status: 'completed',
        durationMs: stepOne.durationMs ?? undefined
      }
    });

    await wait(300);

    const tool = await prisma.tool.findFirst({ orderBy: { createdAt: 'asc' } });
    const stepTwo = await prisma.runStep.create({
      data: {
        runId: run.id,
        stepNumber: 2,
        stepType: 'tool_call',
        toolId: tool?.id,
        input: { tool: tool?.name ?? 'generic_task' },
        output: { status: 'ok' },
        durationMs: 640
      }
    });

    if (tool) {
      await prisma.toolRun.create({
        data: {
          toolId: tool.id,
          runId: run.id,
          runStepId: stepTwo.id,
          traceId: run.traceId,
          input: { task: 'execute tool' },
          output: { status: 'ok' },
          durationMs: stepTwo.durationMs
        }
      });
    }

    await logAuditEvent({
      userId: run.userId,
      personaId: run.personaId,
      runId: run.id,
      traceId: run.traceId,
      eventType: 'tool_call',
      description: `Tool executed for run ${run.id}`,
      metadata: { toolName: tool?.name ?? 'generic_task' }
    });

    publishRunUpdate({
      runId,
      status: 'running',
      step: {
        id: stepTwo.id,
        stepNumber: stepTwo.stepNumber,
        stepType: stepTwo.stepType,
        toolName: tool?.name,
        status: 'completed',
        durationMs: stepTwo.durationMs ?? undefined
      }
    });

    const storageRoot = process.env.STORAGE_PATH ?? './storage';
    const artifactDir = path.join(storageRoot, 'artifacts');
    await fs.mkdir(artifactDir, { recursive: true });
    const artifactPath = path.join(artifactDir, `${run.id}-output.txt`);
    await fs.writeFile(artifactPath, `Run ${run.id} completed.`);

    await prisma.attachment.create({
      data: {
        runId: run.id,
        name: `${run.id}-output.txt`,
        filePath: artifactPath,
        fileSize: BigInt(Buffer.byteLength(`Run ${run.id} completed.`)),
        mimeType: 'text/plain'
      }
    });

    await prisma.run.update({
      where: { id: runId },
      data: { status: 'completed', output: 'Run completed', completedAt: new Date() }
    });

    await logAuditEvent({
      userId: run.userId,
      personaId: run.personaId,
      runId: run.id,
      traceId: run.traceId,
      eventType: 'run_completed',
      description: `Run ${run.id} completed`,
      eventCategory: 'system'
    });

    publishRunCompleted({ runId, status: 'completed', output: 'Run completed' });
  } catch (error) {
    await prisma.run.update({
      where: { id: runId },
      data: { status: 'failed', errorMessage: error instanceof Error ? error.message : 'Run failed' }
    });
    await logAuditEvent({
      userId: run.userId,
      personaId: run.personaId,
      runId: run.id,
      traceId: run.traceId,
      eventType: 'run_failed',
      description: `Run ${run.id} failed`,
      eventCategory: 'error',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    publishRunError({
      runId,
      error: 'run_failed',
      errorMessage: error instanceof Error ? error.message : 'Run failed'
    });
  }
}
