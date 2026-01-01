import { DashboardShell } from '@/components/layout/DashboardShell';

const runs = [
  { id: 'run-1842', persona: 'Atlas', agent: 'Email Triage', status: 'running' },
  { id: 'run-1841', persona: 'Nova', agent: 'Research', status: 'completed' },
  { id: 'run-1840', persona: 'Echo', agent: 'Video', status: 'failed' }
];

export default function RunsPage() {
  return (
    <DashboardShell>
      <header>
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-space)' }}>
          Runs
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Track durable workflows, tool calls, and artifacts.
        </p>
      </header>
      <section className="glass-panel divide-y divide-[var(--color-outline)]">
        {runs.map((run) => (
          <div key={run.id} className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">{run.id}</p>
              <p className="text-lg">{run.persona} - {run.agent}</p>
            </div>
            <span className="text-xs uppercase text-[var(--color-text-secondary)]">{run.status}</span>
          </div>
        ))}
      </section>
    </DashboardShell>
  );
}
