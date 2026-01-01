'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { apiFetch } from '@/lib/api/client';

type DocumentSummary = {
  id: string;
  name: string;
  status: string;
  chunkCount: number;
};

export default function MemoryPage() {
  const params = useParams<{ personaId: string }>();
  const personaId = params?.personaId;
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!personaId) return;
    apiFetch<{ data: DocumentSummary[] }>(`/personas/${personaId}/memory`)
      .then((response) => setDocuments(response.data))
      .catch(() => setDocuments([]));
  }, [personaId]);

  async function handleUpload(event: React.FormEvent) {
    event.preventDefault();
    if (!personaId || !file) {
      setUploadError('Select a file to upload.');
      return;
    }

    setUploadError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await apiFetch(`/personas/${personaId}/memory/upload`, {
        method: 'POST',
        body: formData
      });
      setFile(null);
      if (personaId) {
        apiFetch<{ data: DocumentSummary[] }>(`/personas/${personaId}/memory`)
          .then((response) => setDocuments(response.data))
          .catch(() => setDocuments([]));
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    }
  }

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
      <form onSubmit={handleUpload} className="glass-panel space-y-3 p-6">
        <input
          type="file"
          className="block w-full text-sm text-[var(--color-text-secondary)]"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        {uploadError ? <p className="text-sm text-[var(--color-secondary)]">{uploadError}</p> : null}
        <button className="neon-button rounded-md px-6 py-2 text-xs" type="submit">
          Upload document
        </button>
      </form>
      <section className="glass-panel divide-y divide-[var(--color-outline)]">
        {documents.length === 0 ? (
          <p className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">No documents uploaded.</p>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-lg">{doc.name}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">{doc.chunkCount} chunks</p>
              </div>
              <span className="text-xs uppercase text-[var(--color-text-secondary)]">{doc.status}</span>
            </div>
          ))
        )}
      </section>
    </DashboardShell>
  );
}
