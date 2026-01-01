'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { apiFetch } from '@/lib/api/client';

type PersonaDetail = {
  id: string;
  name: string;
  description?: string | null;
  systemPrompt: string;
  defaultProvider: string;
  fallbackProviders?: string[] | null;
  isActive: boolean;
  containerId?: string | null;
  agents: Array<{ id: string; name: string; description?: string | null; isActive: boolean }>;
};

type ToolSummary = {
  id: string;
  toolName: string;
  toolDescription: string;
  isEnabled: boolean;
};

type MemorySummary = {
  data: Array<{ id: string; name: string; status: string }>;
};

export default function PersonaDetailPage() {
  const params = useParams<{ id: string }>();
  const personaId = params?.id;
  const [persona, setPersona] = useState<PersonaDetail | null>(null);
  const [tools, setTools] = useState<ToolSummary[]>([]);
  const [memoryDocs, setMemoryDocs] = useState<MemorySummary['data']>([]);
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!personaId) return;
    apiFetch<PersonaDetail>(`/personas/${personaId}`)
      .then(setPersona)
      .catch(() => setPersona(null));

    apiFetch<{ data: ToolSummary[] }>(`/personas/${personaId}/tools`)
      .then((response) => setTools(response.data))
      .catch(() => setTools([]));

    apiFetch<MemorySummary>(`/personas/${personaId}/memory?limit=5`)
      .then((response) => setMemoryDocs(response.data))
      .catch(() => setMemoryDocs([]));
  }, [personaId]);

  async function handleCreateAgent(event: React.FormEvent) {
    event.preventDefault();
    if (!personaId) return;
    setError(null);

    try {
      await apiFetch(`/personas/${personaId}/agents`, {
        method: 'POST',
        body: JSON.stringify({ name: agentName, description: agentDescription })
      });
      setAgentName('');
      setAgentDescription('');
      const updated = await apiFetch<PersonaDetail>(`/personas/${personaId}`);
      setPersona(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent');
    }
  }

  return (
    <DashboardShell>
      <header>
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-space)' }}>
          {persona?.name ?? 'Persona Overview'}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          {persona?.description ?? 'Provider routing, tool grants, and run health signals.'}
        </p>
      </header>
      <section className="glass-panel space-y-4 p-6">
        <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Default Provider</p>
            <p className="mt-2 text-lg">{persona?.defaultProvider ?? 'OpenAI'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Fallbacks</p>
            <p className="mt-2 text-lg">
              {persona?.fallbackProviders?.length ? persona?.fallbackProviders.join(', ') : 'None'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Container Status</p>
            <p className="mt-2 text-lg text-[var(--color-secondary)]">
              {persona?.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">System Prompt</p>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {persona?.systemPrompt ?? 'Loading...'}
          </p>
        </div>
      </section>
      <section className="grid gap-4 tablet:grid-cols-2">
        <div className="glass-panel p-6">
          <h2 className="text-lg" style={{ fontFamily: 'var(--font-space)' }}>
            Agents
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-[var(--color-text-secondary)]">
            {persona?.agents?.length ? (
              persona.agents.map((agent) => (
                <li key={agent.id}>
                  {agent.name} {agent.isActive ? '' : '(inactive)'}
                </li>
              ))
            ) : (
              <li>No agents yet.</li>
            )}
          </ul>
          <form onSubmit={handleCreateAgent} className="mt-4 space-y-2">
            <input
              className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-3 py-2 text-sm"
              placeholder="Agent name"
              value={agentName}
              onChange={(event) => setAgentName(event.target.value)}
            />
            <input
              className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-3 py-2 text-sm"
              placeholder="Agent description"
              value={agentDescription}
              onChange={(event) => setAgentDescription(event.target.value)}
            />
            {error ? <p className="text-xs text-[var(--color-secondary)]">{error}</p> : null}
            <button type="submit" className="neon-button rounded-md px-4 py-2 text-xs">
              Add agent
            </button>
          </form>
        </div>
        <div className="glass-panel p-6">
          <h2 className="text-lg" style={{ fontFamily: 'var(--font-space)' }}>
            Tool Access
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-[var(--color-text-secondary)]">
            {tools.length ? (
              tools.map((tool) => (
                <li key={tool.id}>
                  {tool.toolName} {tool.isEnabled ? '' : '(disabled)'}
                </li>
              ))
            ) : (
              <li>No tools enabled.</li>
            )}
          </ul>
        </div>
      </section>
      <section className="grid gap-4 tablet:grid-cols-2">
        <div className="glass-panel p-6">
          <h2 className="text-lg" style={{ fontFamily: 'var(--font-space)' }}>
            Memory Uploads
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-text-secondary)]">
            {memoryDocs.length ? (
              memoryDocs.map((doc) => (
                <li key={doc.id}>{doc.name} ({doc.status})</li>
              ))
            ) : (
              <li>No documents uploaded.</li>
            )}
          </ul>
        </div>
        <div className="glass-panel p-6">
          <h2 className="text-lg" style={{ fontFamily: 'var(--font-space)' }}>
            Connector Readiness
          </h2>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            Configure email, browser, and desktop VM connectors in settings.
          </p>
        </div>
      </section>
    </DashboardShell>
  );
}
