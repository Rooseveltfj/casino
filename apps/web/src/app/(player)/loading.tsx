import { Skeleton } from "@casino/ui";

export default function PlayerLoading() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Hero skeleton */}
      <Skeleton className="h-[340px] sm:h-[400px] w-full rounded-2xl" />

      {/* Section header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-5 w-20" />
      </div>

      {/* Game grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[3/4] rounded-xl" />
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
