import crypto from 'node:crypto';

export function generateTraceId(): string {
  return `run-${crypto.randomUUID()}`;
}
