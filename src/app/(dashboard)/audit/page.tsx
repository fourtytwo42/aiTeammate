'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { apiFetch } from '@/lib/api/client';

type AuditEvent = {
  id: string;
  eventType: string;
  description: string;
};

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    apiFetch<{ data: AuditEvent[] }>('/audit?limit=20')
      .then((response) => setEvents(response.data))
      .catch(() => setEvents([]));
  }, []);

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
        {events.length === 0 ? (
          <p className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">No audit events yet.</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="px-6 py-4">
              <p className="text-sm text-[var(--color-text-secondary)]">{event.eventType}</p>
              <p className="text-lg">{event.description}</p>
            </div>
          ))
        )}
      </section>
    </DashboardShell>
  );
}
