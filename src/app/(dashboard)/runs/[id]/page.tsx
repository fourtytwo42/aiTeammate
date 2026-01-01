'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { apiFetch } from '@/lib/api/client';

type RunDetail = {
  id: string;
  traceId?: string | null;
  status: string;
  input: string;
  output?: string | null;
  steps: Array<{
    id: string;
    stepNumber: number;
    stepType: string;
    toolName?: string | null;
  }>;
};

export default function RunDetailPage() {
  const params = useParams<{ id: string }>();
  const runId = params?.id;
  const [run, setRun] = useState<RunDetail | null>(null);

  useEffect(() => {
    if (!runId) return;
    apiFetch<RunDetail>(`/runs/${runId}`)
      .then(setRun)
      .catch(() => setRun(null));
  }, [runId]);

  return (
    <DashboardShell>
      <header>
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-space)' }}>
          Run Detail
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Trace ID: {run?.traceId ?? 'Pending'}
        </p>
      </header>
      <section className="glass-panel p-6">
        <h2 className="text-lg" style={{ fontFamily: 'var(--font-space)' }}>
          Execution Timeline
        </h2>
        <div className="line-timeline mt-6 space-y-6 pl-8">
          {run?.steps?.length ? (
            run.steps.map((step) => (
              <div key={step.id}>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Step {step.stepNumber} - {step.stepType}
                </p>
                <p className="text-lg">{step.toolName ?? 'LLM execution'}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--color-text-secondary)]">No steps recorded yet.</p>
          )}
        </div>
      </section>
      {run?.output ? (
        <section className="glass-panel p-6">
          <h2 className="text-lg" style={{ fontFamily: 'var(--font-space)' }}>
            Output
          </h2>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{run.output}</p>
        </section>
      ) : null}
    </DashboardShell>
  );
}
