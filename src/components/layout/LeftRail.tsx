import Link from 'next/link';
import { PersonaCard } from '@/components/PersonaCard';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/personas', label: 'Personas' },
  { href: '/runs', label: 'Runs' },
  { href: '/tools', label: 'Tools' },
  { href: '/memory/atlas', label: 'Memory' },
  { href: '/audit', label: 'Audit' },
  { href: '/admin', label: 'Admin' }
];

export function LeftRail() {
  return (
    <aside className="glass-panel flex h-full flex-col gap-6 p-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Personas</p>
        <div className="mt-4 grid gap-3">
          <PersonaCard name="Atlas" description="Ops orchestrator" status="running" />
          <PersonaCard name="Nova" description="Research analyst" status="idle" />
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
      </div>
    </aside>
  );
}
