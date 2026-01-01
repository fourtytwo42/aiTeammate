'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api/client';

type ConnectorSummary = {
  email: { enabled: boolean } | null;
  browser: { enabled: boolean } | null;
  desktopVm: { enabled: boolean } | null;
};

type MemorySummary = {
  total: number;
};

type RightRailProps = {
  activePersonaId: string | null;
};

export function RightRail({ activePersonaId }: RightRailProps) {
  const [connectors, setConnectors] = useState<ConnectorSummary | null>(null);
  const [memoryCount, setMemoryCount] = useState(0);

  useEffect(() => {
    if (!activePersonaId) return;
    let isMounted = true;

    apiFetch<ConnectorSummary>(`/personas/${activePersonaId}/connectors`)
      .then((response) => {
        if (isMounted) setConnectors(response);
      })
      .catch(() => {
        if (isMounted) setConnectors(null);
      });

    apiFetch<{ pagination: MemorySummary }>(`/personas/${activePersonaId}/memory`)
      .then((response) => {
        if (isMounted) setMemoryCount(response.pagination.total);
      })
      .catch(() => {
        if (isMounted) setMemoryCount(0);
      });

    return () => {
      isMounted = false;
    };
  }, [activePersonaId]);

  const emailStatus = connectors?.email?.enabled ?? false;
  const browserStatus = connectors?.browser?.enabled ?? false;
  const vmStatus = connectors?.desktopVm?.enabled ?? false;

  if (!activePersonaId) {
    return (
      <aside className="glass-panel flex h-full flex-col gap-6 p-4">
        <p className="text-sm text-[var(--color-text-secondary)]">Select a persona to view details.</p>
      </aside>
    );
  }

  return (
    <aside className="glass-panel flex h-full flex-col gap-6 p-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Connectors</p>
        <div className="mt-4 space-y-3 text-sm text-[var(--color-text-secondary)]">
          <div className="flex items-center justify-between">
            <span>Email</span>
            <span className={emailStatus ? 'text-[var(--color-secondary)]' : ''}>
              {emailStatus ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Browser</span>
            <span className={browserStatus ? 'text-[var(--color-secondary)]' : ''}>
              {browserStatus ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Desktop VM</span>
            <span className={vmStatus ? 'text-[var(--color-secondary)]' : ''}>
              {vmStatus ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--color-outline)] pt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Memory</p>
        <div className="mt-4 space-y-2 text-sm text-[var(--color-text-secondary)]">
          <div className="flex items-center justify-between">
            <span>Documents</span>
            <span className="text-[var(--color-text-primary)]">{memoryCount}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
