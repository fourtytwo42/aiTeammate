type StoryCardProps = {
  title: string;
  value: string;
  state?: 'idle' | 'loading' | 'updated' | 'error';
};

export function StoryCard({ title, value, state = 'idle' }: StoryCardProps) {
  const isLoading = state === 'loading';
  const isError = state === 'error';

  return (
    <div className={`glass-panel p-4 ${isLoading ? 'shimmer-surface' : ''}`}>
      <h3 className="text-sm text-[var(--color-text-secondary)]">{title}</h3>
      <p className={`mt-2 text-2xl ${isError ? 'text-[var(--color-secondary)]' : ''}`}>{value}</p>
    </div>
  );
}
