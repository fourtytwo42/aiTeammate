import { ReactNode } from 'react';
import { LeftRail } from './LeftRail';
import { RightRail } from './RightRail';

type DashboardShellProps = {
  children: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
};

export function DashboardShell({ children, left, right }: DashboardShellProps) {
  return (
    <main className="grid gap-6 px-6 py-8 tablet:grid-cols-[240px_1fr] desktop:grid-cols-[280px_1fr_320px]">
      {left ?? <LeftRail />}
      <section className="min-h-[70vh] space-y-6">{children}</section>
      <div className="hidden desktop:block">{right ?? <RightRail />}</div>
    </main>
  );
}
