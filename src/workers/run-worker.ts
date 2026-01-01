import { executeRun } from '@/lib/orchestrator/runner';

export async function startRunWorker(runId: string) {
  await executeRun(runId);
}
