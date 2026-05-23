import { Skeleton } from "@casino/ui";

export default function GameDetailLoading() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3">
      {/* Breadcrumb skeleton */}
      <Skeleton className="hidden md:block h-4 w-56 mb-4" />

      <div className="flex flex-col md:flex-row gap-4">
        {/* Game frame skeleton */}
        <div className="flex-1">
          <Skeleton className="w-full aspect-[4/3] sm:aspect-video rounded-xl" />
        </div>

        {/* Sidebar skeleton (desktop) */}
        <aside className="hidden md:block w-full max-w-xs space-y-3">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </aside>
      </div>
    </div>
  );
}
