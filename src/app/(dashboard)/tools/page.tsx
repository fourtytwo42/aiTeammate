'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { apiFetch } from '@/lib/api/client';

type ToolSummary = {
  id: string;
  name: string;
  description: string;
  category?: string | null;
};

export default function ToolsPage() {
  const [tools, setTools] = useState<ToolSummary[]>([]);

  useEffect(() => {
    apiFetch<{ data: ToolSummary[] }>('/tools')
      .then((response) => setTools(response.data))
      .catch(() => setTools([]));
  }, []);

  return (
    <DashboardShell>
      <header>
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-space)' }}>
          Tools
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Search and enable tools without bloating prompt context.
        </p>
      </header>
      <section className="grid gap-4 tablet:grid-cols-2">
        {tools.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">No tools registered.</p>
        ) : (
          tools.map((tool) => (
            <div key={tool.id} className="glass-panel p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                {tool.category ?? 'general'}
              </p>
              <h2 className="mt-2 text-lg" style={{ fontFamily: 'var(--font-space)' }}>
                {tool.name}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{tool.description}</p>
            </div>
          ))
        )}
      </section>
    </DashboardShell>
  );
}
