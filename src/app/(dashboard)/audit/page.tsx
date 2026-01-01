import { DashboardShell } from '@/components/layout/DashboardShell';

const events = [
  { id: 'evt-901', type: 'tool_call', description: 'generate_powerpoint executed' },
  { id: 'evt-900', type: 'email_sent', description: 'Sent report to hr@company.com' }
];

export default function AuditPage() {
  return (
    <DashboardShell>
      <header>
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-space)' }}>
          Audit Log
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Full traceability across tools, connectors, and memory access.
        </p>
      </header>
      <section className="glass-panel divide-y divide-[var(--color-outline)]">
        {events.map((event) => (
          <div key={event.id} className="px-6 py-4">
            <p className="text-sm text-[var(--color-text-secondary)]">{event.type}</p>
            <p className="text-lg">{event.description}</p>
          </div>
        ))}
      </section>
    </DashboardShell>
  );
}
