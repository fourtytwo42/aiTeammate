'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { StoryCard } from '@/components/StoryCard';
import { apiFetch } from '@/lib/api/client';

type RunSummary = {
  id: string;
  status: string;
  personaName: string;
  agentName: string;
};

export default function DashboardPage() {
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [personaCount, setPersonaCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    apiFetch<{ data: RunSummary[] }>('/runs?limit=5')
      .then((response) => {
        if (isMounted) setRuns(response.data);
      })
      .catch(() => {
        if (isMounted) setRuns([]);
      });

    apiFetch<{ pagination: { total: number } }>('/personas?limit=1')
      .then((response) => {
        if (isMounted) setPersonaCount(response.pagination.total);
      })
      .catch(() => {
        if (isMounted) setPersonaCount(0);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardShell>
      <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
        <StoryCard title="Personas" value={String(personaCount)} />
        <StoryCard title="Active Runs" value={String(runs.filter((run) => run.status === 'running').length)} />
        <StoryCard title="Completed Runs" value={String(runs.filter((run) => run.status === 'completed').length)} />
        <StoryCard title="Recent Runs" value={String(runs.length)} />
      </div>
      <div className="glass-panel p-6">
        <h2 className="text-xl" style={{ fontFamily: 'var(--font-space)' }}>
          Active Timeline
        </h2>
        <div className="line-timeline mt-6 space-y-6 pl-8">
          {runs.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)]">No runs yet.</p>
          ) : (
            runs.map((run, index) => (
              <div key={run.id}>
                <p className="text-sm text-[var(--color-text-secondary)]">Run {index + 1}</p>
                <p className="text-lg">
                  {run.personaName} - {run.agentName} ({run.status})
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
