import { DashboardShell } from '@/components/layout/DashboardShell';

const users = [
  { name: 'Demo Admin', email: 'admin@persona-platform.local', role: 'admin' },
  { name: 'Demo User', email: 'demo@persona-platform.local', role: 'user' }
];

export default function AdminPage() {
  return (
    <DashboardShell>
      <header>
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-space)' }}>
          Admin
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Monitor system health, manage users, and review alerts.
        </p>
      </header>
      <section className="grid gap-4 tablet:grid-cols-2">
        <div className="glass-panel p-6">
          <h2 className="text-lg" style={{ fontFamily: 'var(--font-space)' }}>
            Active Alerts
          </h2>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            All persona containers healthy. No resource thresholds breached.
          </p>
        </div>
        <div className="glass-panel p-6">
          <h2 className="text-lg" style={{ fontFamily: 'var(--font-space)' }}>
            LLM Spend
          </h2>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            Estimated cost $42.18 this month across 6 personas.
          </p>
        </div>
      </section>
      <section className="glass-panel divide-y divide-[var(--color-outline)]">
        {users.map((user) => (
          <div key={user.email} className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-lg">{user.name}</p>
              <p className="text-sm text-[var(--color-text-secondary)]">{user.email}</p>
            </div>
            <span className="text-xs uppercase text-[var(--color-text-secondary)]">{user.role}</span>
          </div>
        ))}
      </section>
    </DashboardShell>
  );
}
