import { DashboardShell } from '@/components/layout/DashboardShell';

const documents = [
  { name: 'Company Handbook.pdf', status: 'completed', chunks: 150 },
  { name: 'Q1 Board Update.pptx', status: 'processing', chunks: 42 }
];

export default function MemoryPage() {
  return (
    <DashboardShell>
      <header>
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-space)' }}>
          Memory
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Upload, curate, and search RAG knowledge bases per persona.
        </p>
      </header>
      <section className="glass-panel divide-y divide-[var(--color-outline)]">
        {documents.map((doc) => (
          <div key={doc.name} className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-lg">{doc.name}</p>
              <p className="text-sm text-[var(--color-text-secondary)]">{doc.chunks} chunks</p>
            </div>
            <span className="text-xs uppercase text-[var(--color-text-secondary)]">{doc.status}</span>
          </div>
        ))}
      </section>
    </DashboardShell>
  );
}
