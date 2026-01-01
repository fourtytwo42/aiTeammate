import { DashboardShell } from '@/components/layout/DashboardShell';
import { StoryCard } from '@/components/StoryCard';

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
        <StoryCard title="Activity Aura" value="Warm" />
        <StoryCard title="LLM Calls" value="184" />
        <StoryCard title="Success Rate" value="94%" />
        <StoryCard title="Recent Runs" value="7" />
      </div>
      <div className="glass-panel p-6">
        <h2 className="text-xl" style={{ fontFamily: 'var(--font-space)' }}>
          Active Timeline
        </h2>
        <div className="line-timeline mt-6 space-y-6 pl-8">
          <div>
            <p className="text-sm text-[var(--color-text-secondary)]">Step 4</p>
            <p className="text-lg">Generated Q1 report slides</p>
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-secondary)]">Step 5</p>
            <p className="text-lg">Drafted response email for review</p>
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-secondary)]">Step 6</p>
            <p className="text-lg">Queued delivery to HR inbox</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
