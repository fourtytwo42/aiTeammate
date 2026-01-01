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

type ProviderConfig = {
  id: string;
  provider: string;
  model?: string | null;
  baseUrl?: string | null;
  isEnabled: boolean;
  hasApiKey: boolean;
};

type ProviderSettings = {
  defaultProvider: string;
  fallbackProviders: string[];
  configs: ProviderConfig[];
};

type EmailConnector = {
  enabled: boolean;
  imapHost: string | null;
  imapPort: number | null;
  smtpHost: string | null;
  smtpPort: number | null;
  username: string | null;
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
  const [providerSettings, setProviderSettings] = useState<ProviderSettings | null>(null);
  const [defaultProvider, setDefaultProvider] = useState('');
  const [fallbackProviders, setFallbackProviders] = useState('');
  const [providerForm, setProviderForm] = useState({
    provider: 'openai',
    model: '',
    baseUrl: '',
    apiKey: '',
    isEnabled: true
  });
  const [emailForm, setEmailForm] = useState({
    enabled: false,
    imapHost: '',
    imapPort: 993,
    imapUsername: '',
    imapPassword: '',
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: ''
  });
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
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

    apiFetch<ProviderSettings>(`/personas/${personaId}/providers`)
      .then((response) => {
        setProviderSettings(response);
        setDefaultProvider(response.defaultProvider);
        setFallbackProviders(response.fallbackProviders.join(', '));
      })
      .catch(() => setProviderSettings(null));

    apiFetch<{ email: EmailConnector }>(`/personas/${personaId}/connectors`)
      .then((response) => {
        const email = response.email;
        setEmailForm({
          enabled: email.enabled,
          imapHost: email.imapHost ?? '',
          imapPort: email.imapPort ?? 993,
          imapUsername: email.username ?? '',
          imapPassword: '',
          smtpHost: email.smtpHost ?? '',
          smtpPort: email.smtpPort ?? 587,
          smtpUsername: email.username ?? '',
          smtpPassword: ''
        });
      })
      .catch(() => undefined);
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

  async function handleUpdateProviders(event: React.FormEvent) {
    event.preventDefault();
    if (!personaId) return;
    setError(null);

    try {
      await apiFetch(`/personas/${personaId}/providers`, {
        method: 'PUT',
        body: JSON.stringify({
          defaultProvider,
          fallbackProviders: fallbackProviders
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        })
      });

      const refreshed = await apiFetch<ProviderSettings>(`/personas/${personaId}/providers`);
      setProviderSettings(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update providers');
    }
  }

  async function handleSaveProviderConfig(event: React.FormEvent) {
    event.preventDefault();
    if (!personaId) return;
    setError(null);

    try {
      await apiFetch(`/personas/${personaId}/providers`, {
        method: 'POST',
        body: JSON.stringify({
          provider: providerForm.provider,
          model: providerForm.model || undefined,
          baseUrl: providerForm.baseUrl || undefined,
          apiKey: providerForm.apiKey || undefined,
          isEnabled: providerForm.isEnabled
        })
      });

      setProviderForm({ provider: 'openai', model: '', baseUrl: '', apiKey: '', isEnabled: true });
      const refreshed = await apiFetch<ProviderSettings>(`/personas/${personaId}/providers`);
      setProviderSettings(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save provider');
    }
  }

  async function handleSaveEmailConnector(event: React.FormEvent) {
    event.preventDefault();
    if (!personaId) return;
    setError(null);
    setEmailStatus(null);

    try {
      await apiFetch(`/personas/${personaId}/connectors/email`, {
        method: 'PUT',
        body: JSON.stringify({
          enabled: emailForm.enabled,
          imapHost: emailForm.imapHost,
          imapPort: Number(emailForm.imapPort),
          imapUsername: emailForm.imapUsername,
          imapPassword: emailForm.imapPassword,
          smtpHost: emailForm.smtpHost,
          smtpPort: Number(emailForm.smtpPort),
          smtpUsername: emailForm.smtpUsername,
          smtpPassword: emailForm.smtpPassword
        })
      });

      setEmailForm((prev) => ({
        ...prev,
        imapPassword: '',
        smtpPassword: ''
      }));
      setEmailStatus('Saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save email connector');
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
            Provider Defaults
          </h2>
          <form onSubmit={handleUpdateProviders} className="mt-4 space-y-3">
            <select
              className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-3 py-2 text-sm"
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
              className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-3 py-2 text-sm"
              placeholder="Fallback providers (comma-separated)"
              value={fallbackProviders}
              onChange={(event) => setFallbackProviders(event.target.value)}
            />
            <button type="submit" className="neon-button rounded-md px-4 py-2 text-xs">
              Save defaults
            </button>
          </form>
        </div>
        <div className="glass-panel p-6">
          <h2 className="text-lg" style={{ fontFamily: 'var(--font-space)' }}>
            Provider Config
          </h2>
          <form onSubmit={handleSaveProviderConfig} className="mt-4 space-y-3">
            <select
              className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-3 py-2 text-sm"
              value={providerForm.provider}
              onChange={(event) => setProviderForm((prev) => ({ ...prev, provider: event.target.value }))}
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="groq">Groq</option>
              <option value="ollama">Ollama</option>
              <option value="lmstudio">LM Studio</option>
              <option value="litellm">LiteLLM</option>
            </select>
            <input
              className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-3 py-2 text-sm"
              placeholder="Model (e.g. gpt-4o-mini)"
              value={providerForm.model}
              onChange={(event) => setProviderForm((prev) => ({ ...prev, model: event.target.value }))}
            />
            <input
              className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-3 py-2 text-sm"
              placeholder="Base URL (optional for local providers)"
              value={providerForm.baseUrl}
              onChange={(event) => setProviderForm((prev) => ({ ...prev, baseUrl: event.target.value }))}
            />
            <input
              className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-3 py-2 text-sm"
              placeholder="API key (optional)"
              value={providerForm.apiKey}
              onChange={(event) => setProviderForm((prev) => ({ ...prev, apiKey: event.target.value }))}
            />
            <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
              <input
                type="checkbox"
                checked={providerForm.isEnabled}
                onChange={(event) => setProviderForm((prev) => ({ ...prev, isEnabled: event.target.checked }))}
              />
              Enabled
            </label>
            <button type="submit" className="neon-button rounded-md px-4 py-2 text-xs">
              Save provider
            </button>
          </form>
        </div>
      </section>
      <section className="glass-panel p-6">
        <h2 className="text-lg" style={{ fontFamily: 'var(--font-space)' }}>
          Configured Providers
        </h2>
        <div className="mt-4 space-y-3 text-sm text-[var(--color-text-secondary)]">
          {providerSettings?.configs?.length ? (
            providerSettings.configs.map((config) => (
              <div key={config.id} className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--color-text-primary)]">{config.provider}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {config.model ?? 'no model'} {config.baseUrl ? `- ${config.baseUrl}` : ''}
                  </p>
                </div>
                <div className="text-xs uppercase">
                  {config.isEnabled ? 'Enabled' : 'Disabled'} {config.hasApiKey ? '- Key' : '- No Key'}
                </div>
              </div>
            ))
          ) : (
            <p>No providers configured yet.</p>
          )}
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
            Email Connector
          </h2>
          <form onSubmit={handleSaveEmailConnector} className="mt-4 space-y-3">
            <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
              <input
                type="checkbox"
                checked={emailForm.enabled}
                onChange={(event) => setEmailForm((prev) => ({ ...prev, enabled: event.target.checked }))}
              />
              Enabled
            </label>
            <input
              className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-3 py-2 text-sm"
              placeholder="IMAP host"
              value={emailForm.imapHost}
              onChange={(event) => setEmailForm((prev) => ({ ...prev, imapHost: event.target.value }))}
            />
            <input
              className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-3 py-2 text-sm"
              placeholder="IMAP port"
              type="number"
              value={emailForm.imapPort}
              onChange={(event) => setEmailForm((prev) => ({ ...prev, imapPort: Number(event.target.value) }))}
            />
            <input
              className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-3 py-2 text-sm"
              placeholder="IMAP username"
              value={emailForm.imapUsername}
              onChange={(event) => setEmailForm((prev) => ({ ...prev, imapUsername: event.target.value }))}
            />
            <input
              className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-3 py-2 text-sm"
              placeholder="IMAP password"
              type="password"
              value={emailForm.imapPassword}
              onChange={(event) => setEmailForm((prev) => ({ ...prev, imapPassword: event.target.value }))}
            />
            <input
              className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-3 py-2 text-sm"
              placeholder="SMTP host"
              value={emailForm.smtpHost}
              onChange={(event) => setEmailForm((prev) => ({ ...prev, smtpHost: event.target.value }))}
            />
            <input
              className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-3 py-2 text-sm"
              placeholder="SMTP port"
              type="number"
              value={emailForm.smtpPort}
              onChange={(event) => setEmailForm((prev) => ({ ...prev, smtpPort: Number(event.target.value) }))}
            />
            <input
              className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-3 py-2 text-sm"
              placeholder="SMTP username"
              value={emailForm.smtpUsername}
              onChange={(event) => setEmailForm((prev) => ({ ...prev, smtpUsername: event.target.value }))}
            />
            <input
              className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-3 py-2 text-sm"
              placeholder="SMTP password"
              type="password"
              value={emailForm.smtpPassword}
              onChange={(event) => setEmailForm((prev) => ({ ...prev, smtpPassword: event.target.value }))}
            />
            {emailStatus ? <p className="text-xs text-[var(--color-secondary)]">{emailStatus}</p> : null}
            <button type="submit" className="neon-button rounded-md px-4 py-2 text-xs">
              Save email connector
            </button>
          </form>
        </div>
      </section>
    </DashboardShell>
  );
}
