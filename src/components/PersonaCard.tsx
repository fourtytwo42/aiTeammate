type PersonaCardProps = {
  name: string;
  description?: string;
  status: 'idle' | 'running' | 'failed';
};

export function PersonaCard({ name, description, status }: PersonaCardProps) {
  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg" style={{ fontFamily: 'var(--font-space)' }}>
          {name}
        </h3>
        <span className="text-xs uppercase text-[var(--color-text-secondary)]">
          {status}
        </span>
      </div>
      {description ? (
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
