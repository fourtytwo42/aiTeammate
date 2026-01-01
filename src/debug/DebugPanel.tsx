'use client';

export function DebugPanel() {
  if (process.env.NEXT_PUBLIC_DEBUG_PANEL !== 'true') {
    return null;
  }

  return (
    <aside aria-label="Debug panel">
      <h3>Debug Panel</h3>
      <p>Route, auth, flags, and network data will appear here.</p>
    </aside>
  );
}
