'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { apiFetch } from '@/lib/api/client';

type RunSummary = {
  id: string;
  personaName: string;
  agentName: string;
  status: string;
};

type AgentSummary = {
  id: string;
  name: string;
};

type PersonaSummary = {
  id: string;
  name: string;
};

export default function RunsPage() {
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [personas, setPersonas] = useState<PersonaSummary[]>([]);
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  function loadRuns() {
    apiFetch<{ data: RunSummary[] }>('/runs?limit=20')
      .then((response) => setRuns(response.data))
      .catch(() => setRuns([]));
  }

  useEffect(() => {
    loadRuns();
    apiFetch<{ data: PersonaSummary[] }>('/personas')
      .then((response) => {
        setPersonas(response.data);
        if (response.data.length) {
          setSelectedPersona(response.data[0].id);
        }
      })
      .catch(() => setPersonas([]));
  }, []);

  useEffect(() => {
    if (!selectedPersona) {
      setAgents([]);
      return;
    }
    apiFetch<{ data: AgentSummary[] }>(`/personas/${selectedPersona}/agents`)
      .then((response) => {
        setAgents(response.data);
        setSelectedAgent(response.data[0]?.id ?? '');
      })
      .catch(() => setAgents([]));
  }, [selectedPersona]);

  async function handleCreateRun(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!selectedAgent) {
      setError('Select an agent before creating a run.');
      return;
    }

    try {
      await apiFetch('/runs', {
        method: 'POST',
        body: JSON.stringify({ agentId: selectedAgent, input })
      });
      setInput('');
      loadRuns();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create run');
    }
  }

  return (
    <DashboardShell>
      <header>
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-space)' }}>
          Runs
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Track durable workflows, tool calls, and artifacts.
        </p>
      </header>
      <form onSubmit={handleCreateRun} className="glass-panel space-y-3 p-6">
        <div className="grid gap-3 tablet:grid-cols-2">
          <select
            className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-3 py-2 text-sm"
            value={selectedPersona}
            onChange={(event) => setSelectedPersona(event.target.value)}
          >
            {personas.map((persona) => (
              <option key={persona.id} value={persona.id}>
                {persona.name}
              </option>
            ))}
          </select>
          <select
            className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-3 py-2 text-sm"
            value={selectedAgent}
            onChange={(event) => setSelectedAgent(event.target.value)}
          >
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>
        <textarea
          className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-3 py-2 text-sm"
          placeholder="Run input"
          rows={3}
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        {error ? <p className="text-sm text-[var(--color-secondary)]">{error}</p> : null}
        <button className="neon-button rounded-md px-6 py-2 text-xs" type="submit">
          Create run
        </button>
      </form>
      <section className="glass-panel divide-y divide-[var(--color-outline)]">
        {runs.length === 0 ? (
          <p className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">No runs yet.</p>
        ) : (
          runs.map((run) => (
            <div key={run.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <Link href={`/runs/${run.id}`} className="text-sm text-[var(--color-text-secondary)]">
                  {run.id}
                </Link>
                <p className="text-lg">{run.personaName} - {run.agentName}</p>
              </div>
              <span className="text-xs uppercase text-[var(--color-text-secondary)]">{run.status}</span>
            </div>
          ))
        )}
      </section>
    </DashboardShell>
  );
}
