import { Skeleton } from "@casino/ui";

export default function PerfilLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* User card */}
      <div className="rounded-xl border border-border-default bg-surface-elevated p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>
      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      {/* Sessions */}
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}
