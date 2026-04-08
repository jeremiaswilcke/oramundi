export default function PrayLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] px-4 items-center justify-center">
      <div className="w-64 h-64 relative">
        {/* Skeleton beads */}
        {Array.from({ length: 10 }, (_, i) => {
          const angle = (i / 10) * 2 * Math.PI - Math.PI / 2;
          const x = 128 + 110 * Math.cos(angle);
          const y = 128 + 110 * Math.sin(angle);
          return (
            <div
              key={i}
              className="absolute w-6 h-6 rounded-full skeleton-shimmer -translate-x-1/2 -translate-y-1/2"
              style={{ left: x, top: y, animationDelay: `${i * 0.1}s` }}
            />
          );
        })}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full skeleton-shimmer" />
      </div>
    </div>
  );
}
