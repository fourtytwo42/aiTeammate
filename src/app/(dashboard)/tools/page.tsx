import { DashboardShell } from '@/components/layout/DashboardShell';

const tools = [
  { name: 'generate_powerpoint', description: 'Create slides in .pptx format', category: 'office' },
  { name: 'send_email', description: 'Deliver email with attachments', category: 'email' },
  { name: 'browser_navigate', description: 'Automate research navigation', category: 'browser' }
];

export default function ToolsPage() {
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
        {tools.map((tool) => (
          <div key={tool.name} className="glass-panel p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
              {tool.category}
            </p>
            <h2 className="mt-2 text-lg" style={{ fontFamily: 'var(--font-space)' }}>
              {tool.name}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{tool.description}</p>
          </div>
        ))}
      </section>
    </DashboardShell>
  );
}
