import { DashboardShell } from '@/components/layout/DashboardShell';

export default function PersonaDetailPage() {
  return (
    <DashboardShell>
      <header>
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-space)' }}>
          Persona Overview
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Provider routing, tool grants, and run health signals.
        </p>
      </header>
      <section className="glass-panel space-y-4 p-6">
        <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Default Provider</p>
            <p className="mt-2 text-lg">OpenAI</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Fallbacks</p>
            <p className="mt-2 text-lg">Anthropic, Groq</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Container Status</p>
            <p className="mt-2 text-lg text-[var(--color-secondary)]">Active</p>
          </div>
        </div>
      </section>
      <section className="grid gap-4 tablet:grid-cols-2">
        <div className="glass-panel p-6">
          <h2 className="text-lg" style={{ fontFamily: 'var(--font-space)' }}>
            Agents
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-[var(--color-text-secondary)]">
            <li>Email Triage Agent</li>
            <li>Research Agent</li>
            <li>Document Studio Agent</li>
          </ul>
        </div>
        <div className="glass-panel p-6">
          <h2 className="text-lg" style={{ fontFamily: 'var(--font-space)' }}>
            Tool Access
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-[var(--color-text-secondary)]">
            <li>generate_powerpoint</li>
            <li>send_email</li>
            <li>browser_navigate</li>
          </ul>
        </div>
      </section>
      <section className="grid gap-4 tablet:grid-cols-2">
        <div className="glass-panel p-6">
          <h2 className="text-lg" style={{ fontFamily: 'var(--font-space)' }}>
            Memory Uploads
          </h2>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            24 documents indexed, 6 curated summaries available.
          </p>
        </div>
        <div className="glass-panel p-6">
          <h2 className="text-lg" style={{ fontFamily: 'var(--font-space)' }}>
            Connector Readiness
          </h2>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            Email + Browser active, Desktop VM pending configuration.
          </p>
        </div>
      </section>
    </DashboardShell>
  );
}
