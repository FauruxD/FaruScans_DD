export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-900/60">
      <div className="skeleton-shimmer aspect-[3/4.25]" />
      <div className="space-y-2 p-3">
        <div className="skeleton-shimmer h-4 rounded" />
        <div className="skeleton-shimmer h-4 w-3/4 rounded" />
        <div className="skeleton-shimmer h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}
