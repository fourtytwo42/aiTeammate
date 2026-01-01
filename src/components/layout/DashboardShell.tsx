'use client';

import { ReactNode, useEffect, useState } from 'react';
import { LeftRail } from './LeftRail';
import { RightRail } from './RightRail';
import { apiFetch } from '@/lib/api/client';
import { AuthGuard } from '@/components/AuthGuard';

type PersonaSummary = {
  id: string;
  name: string;
  description?: string | null;
};

type DashboardShellProps = {
  children: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
};

export function DashboardShell({ children, left, right }: DashboardShellProps) {
  const [personas, setPersonas] = useState<PersonaSummary[]>([]);
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    apiFetch<{ data: PersonaSummary[] }>('/personas')
      .then((response) => {
        if (!isMounted) return;
        setPersonas(response.data);
        setActivePersonaId((current) => current ?? response.data[0]?.id ?? null);
      })
      .catch(() => {
        if (!isMounted) return;
        setPersonas([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthGuard>
      <main className="grid gap-6 px-6 py-8 tablet:grid-cols-[240px_1fr] desktop:grid-cols-[280px_1fr_320px]">
        {left ?? (
          <LeftRail
            personas={personas}
            activePersonaId={activePersonaId}
            onSelectPersona={setActivePersonaId}
          />
        )}
        <section className="min-h-[70vh] space-y-6">{children}</section>
        <div className="hidden desktop:block">
          {right ?? <RightRail activePersonaId={activePersonaId} />}
        </div>
      </main>
    </AuthGuard>
  );
}
