export function RightRail() {
  return (
    <aside className="glass-panel flex h-full flex-col gap-6 p-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Connectors</p>
        <div className="mt-4 space-y-3 text-sm text-[var(--color-text-secondary)]">
          <div className="flex items-center justify-between">
            <span>Email</span>
            <span className="text-[var(--color-secondary)]">Enabled</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Browser</span>
            <span className="text-[var(--color-secondary)]">Enabled</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Desktop VM</span>
            <span>Disabled</span>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--color-outline)] pt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Memory</p>
        <div className="mt-4 space-y-2 text-sm text-[var(--color-text-secondary)]">
          <div className="flex items-center justify-between">
            <span>Documents</span>
            <span className="text-[var(--color-text-primary)]">24</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Curated Summaries</span>
            <span className="text-[var(--color-text-primary)]">6</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
