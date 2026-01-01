'use client';

import Link from 'next/link';
import { PersonaCard } from '@/components/PersonaCard';
import { clearTokens } from '@/lib/auth/client';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/personas', label: 'Personas' },
  { href: '/runs', label: 'Runs' },
  { href: '/tools', label: 'Tools' },
  { href: '/memory/atlas', label: 'Memory' },
  { href: '/audit', label: 'Audit' },
  { href: '/admin', label: 'Admin' }
];

type PersonaSummary = {
  id: string;
  name: string;
  description?: string | null;
};

type LeftRailProps = {
  personas: PersonaSummary[];
  activePersonaId: string | null;
  onSelectPersona: (id: string) => void;
};

export function LeftRail({ personas, activePersonaId, onSelectPersona }: LeftRailProps) {
  return (
    <aside className="glass-panel flex h-full flex-col gap-6 p-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Personas</p>
        <div className="mt-4 grid gap-3">
          {personas.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)]">No personas yet.</p>
          ) : (
            personas.map((persona) => (
              <button
                key={persona.id}
                type="button"
                onClick={() => onSelectPersona(persona.id)}
                className="text-left"
              >
                <PersonaCard
                  name={persona.name}
                  description={persona.description ?? undefined}
                  status={activePersonaId === persona.id ? 'running' : 'idle'}
                />
              </button>
            ))
          )}
        </div>
      </div>
      <div className="border-t border-[var(--color-outline)] pt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Navigation</p>
        <nav className="mt-3 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="mt-4 w-full rounded-md border border-[var(--color-outline)] px-3 py-2 text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]"
          onClick={() => {
            clearTokens();
            window.location.assign('/login');
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
