'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { PersonaCard } from '@/components/PersonaCard';
import { apiFetch } from '@/lib/api/client';

type PersonaSummary = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
};

export default function PersonasPage() {
  const [personas, setPersonas] = useState<PersonaSummary[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [defaultProvider, setDefaultProvider] = useState('openai');
  const [fallbackProviders, setFallbackProviders] = useState('');
  const [error, setError] = useState<string | null>(null);

  function loadPersonas() {
    apiFetch<{ data: PersonaSummary[] }>('/personas')
      .then((response) => setPersonas(response.data))
      .catch(() => setPersonas([]));
  }

  useEffect(() => {
    loadPersonas();
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      await apiFetch('/personas', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          systemPrompt: systemPrompt || 'You are a helpful assistant.',
          defaultProvider,
          fallbackProviders: fallbackProviders
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        })
      });
      setName('');
      setDescription('');
      setSystemPrompt('');
      setDefaultProvider('openai');
      setFallbackProviders('');
      loadPersonas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create persona');
    }
  }

  return (
    <DashboardShell>
      <header>
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-space)' }}>
          Personas
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Manage isolated personas, providers, and tool access.
        </p>
      </header>
      <form onSubmit={handleCreate} className="glass-panel space-y-3 p-6">
        <div className="grid gap-3 tablet:grid-cols-2">
          <input
            className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-4 py-2"
            placeholder="Persona name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <input
            className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-4 py-2"
            placeholder="Description (optional)"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <textarea
          className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-4 py-2"
          placeholder="System prompt"
          rows={3}
          value={systemPrompt}
          onChange={(event) => setSystemPrompt(event.target.value)}
        />
        <div className="grid gap-3 tablet:grid-cols-2">
          <select
            className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-4 py-2"
            value={defaultProvider}
            onChange={(event) => setDefaultProvider(event.target.value)}
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="groq">Groq</option>
            <option value="ollama">Ollama</option>
            <option value="lmstudio">LM Studio</option>
            <option value="litellm">LiteLLM</option>
          </select>
          <input
            className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-4 py-2"
            placeholder="Fallback providers (comma-separated)"
            value={fallbackProviders}
            onChange={(event) => setFallbackProviders(event.target.value)}
          />
        </div>
        {error ? <p className="text-sm text-[var(--color-secondary)]">{error}</p> : null}
        <button className="neon-button rounded-md px-6 py-2" type="submit">
          Create persona
        </button>
      </form>
      <section className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
        {personas.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">No personas created yet.</p>
        ) : (
          personas.map((persona) => (
            <Link key={persona.id} href={`/personas/${persona.id}`}>
              <PersonaCard
                name={persona.name}
                description={persona.description ?? undefined}
                status={persona.isActive ? 'running' : 'idle'}
              />
            </Link>
          ))
        )}
      </section>
    </DashboardShell>
  );
}
