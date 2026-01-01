import { describe, expect, test, vi } from 'vitest';
import { publishRunCompleted, publishRunError, publishRunUpdate } from './publisher';

describe('ws publisher', () => {
  test('publishRunUpdate emits event', () => {
    const handler = vi.fn();
    process.on('persona:runUpdate', handler);

    publishRunUpdate({ runId: 'run-1', status: 'running' });
    expect(handler).toHaveBeenCalledWith({ runId: 'run-1', status: 'running' });

    process.off('persona:runUpdate', handler);
  });

  test('publishRunCompleted emits event', () => {
    const handler = vi.fn();
    process.on('persona:runCompleted', handler);

    publishRunCompleted({ runId: 'run-2', status: 'completed', output: 'done' });
    expect(handler).toHaveBeenCalledWith({ runId: 'run-2', status: 'completed', output: 'done' });

    process.off('persona:runCompleted', handler);
  });

  test('publishRunError emits event', () => {
    const handler = vi.fn();
    process.on('persona:runError', handler);

    publishRunError({ runId: 'run-3', error: 'failure', errorMessage: 'Tool failed' });
    expect(handler).toHaveBeenCalledWith({
      runId: 'run-3',
      error: 'failure',
      errorMessage: 'Tool failed'
    });

    process.off('persona:runError', handler);
  });
});
