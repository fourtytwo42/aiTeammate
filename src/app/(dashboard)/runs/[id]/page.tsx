import { DashboardShell } from '@/components/layout/DashboardShell';

export default function RunDetailPage() {
  return (
    <DashboardShell>
      <header>
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-space)' }}>
          Run Detail
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Trace ID: run-1842-ax4
        </p>
      </header>
      <section className="glass-panel p-6">
        <h2 className="text-lg" style={{ fontFamily: 'var(--font-space)' }}>
          Execution Timeline
        </h2>
        <div className="line-timeline mt-6 space-y-6 pl-8">
          <div>
            <p className="text-sm text-[var(--color-text-secondary)]">Step 1 - llm_call</p>
            <p className="text-lg">Planned research outline</p>
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-secondary)]">Step 2 - tool_call</p>
            <p className="text-lg">browser_navigate executed</p>
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-secondary)]">Step 3 - tool_call</p>
            <p className="text-lg">generate_powerpoint created slides</p>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
