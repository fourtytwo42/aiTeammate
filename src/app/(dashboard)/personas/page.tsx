import { DashboardShell } from '@/components/layout/DashboardShell';
import { PersonaCard } from '@/components/PersonaCard';

export default function PersonasPage() {
  return (
    <DashboardShell>
      <header>
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-space)' }}>
          Personas
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Manage isolated personas, providers, and tool access.
        </p>
      </header>
      <section className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
        <PersonaCard name="Atlas" description="Ops orchestrator with email triage" status="running" />
        <PersonaCard name="Nova" description="Research and briefing agent" status="idle" />
        <PersonaCard name="Echo" description="Narrated video generator" status="failed" />
      </section>
    </DashboardShell>
  );
}
