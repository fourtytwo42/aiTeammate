'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { apiFetch } from '@/lib/api/client';

type UserSummary = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

export default function AdminPage() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    apiFetch<{ role: string }>('/users/me')
      .then((response) => setIsAdmin(response.role === 'admin'))
      .catch(() => setIsAdmin(false));
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    apiFetch<{ data: UserSummary[] }>('/admin/users?limit=50')
      .then((response) => setUsers(response.data))
      .catch(() => setUsers([]));
  }, [isAdmin]);

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
      {!isAdmin ? (
        <section className="glass-panel p-6">
          <p className="text-sm text-[var(--color-text-secondary)]">Admin access required.</p>
        </section>
      ) : (
        <>
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
        {users.length === 0 ? (
          <p className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">No users found.</p>
        ) : (
          users.map((user) => (
            <div key={user.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-lg">{user.name ?? 'Unnamed user'}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">{user.email}</p>
              </div>
              <span className="text-xs uppercase text-[var(--color-text-secondary)]">{user.role}</span>
            </div>
          ))
        )}
      </section>
        </>
      )}
    </DashboardShell>
  );
}
