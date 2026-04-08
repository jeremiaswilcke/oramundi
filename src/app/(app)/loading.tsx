export default function Loading() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-7.5rem)] px-6 pt-6">
      {/* Skeleton header */}
      <div className="h-10 w-48 skeleton-shimmer rounded-xl mb-2" />
      <div className="h-8 w-32 skeleton-shimmer rounded-xl mb-6" />

      {/* Skeleton cards */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl p-4 bg-surface-container">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full skeleton-shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 skeleton-shimmer rounded" />
                <div className="h-3 w-full skeleton-shimmer rounded" />
                <div className="h-3 w-3/4 skeleton-shimmer rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
