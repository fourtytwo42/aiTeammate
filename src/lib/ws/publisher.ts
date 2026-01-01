export type RunUpdatePayload = {
  runId: string;
  status: string;
  step?: {
    id: string;
    stepNumber: number;
    stepType: string;
    toolName?: string;
    status?: string;
    durationMs?: number;
  };
};

export type RunCompletedPayload = {
  runId: string;
  status: string;
  output: string;
};

export type RunErrorPayload = {
  runId: string;
  error: string;
  errorMessage?: string;
};

export function publishRunUpdate(payload: RunUpdatePayload) {
  (process as NodeJS.EventEmitter).emit('persona:runUpdate', payload);
}

export function publishRunCompleted(payload: RunCompletedPayload) {
  (process as NodeJS.EventEmitter).emit('persona:runCompleted', payload);
}

export function publishRunError(payload: RunErrorPayload) {
  (process as NodeJS.EventEmitter).emit('persona:runError', payload);
}
