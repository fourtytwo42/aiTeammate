import { redis } from './redis';

export async function publishToolExecution(personaId: string, toolId: string, parameters: unknown, traceId: string) {
  const message = {
    personaId,
    toolId,
    parameters,
    traceId,
    timestamp: Date.now()
  };

  await redis.publish(`tool:execute:${personaId}`, JSON.stringify(message));
}
