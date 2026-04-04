"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const pulse =
  "animate-pulse rounded-lg bg-slate-200/75 dark:bg-slate-700/50";

export type DetailPanelSkeletonProps = {
  className?: string;
  /**
   * `embedded` — split column (inset shadow). `overlay` — slide-over panel border.
   */
  variant?: "overlay" | "embedded";
};

/**
 * Loading placeholder matching enquiry detail drawer layout (header, toolbar, message, details, activity, notes).
 */
export function DetailPanelSkeleton({
  className,
  variant = "overlay",
}: DetailPanelSkeletonProps) {
  const embedded = variant === "embedded";
  return (
    <div
      className={cn(
        "flex h-full min-h-0 min-w-0 flex-col bg-white",
        embedded
          ? "shadow-[inset_1px_0_0_rgba(15,23,42,0.04)]"
          : "border-l border-slate-200/70",
        className
      )}
      role="status"
      aria-busy="true"
      aria-label="Loading enquiry details"
    >
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200/70 bg-white px-6 py-5 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
        <div className="flex min-w-0 flex-1 gap-4">
          <Skeleton className={cn("size-12 shrink-0 rounded-full", pulse)} />
          <div className="min-w-0 flex-1 space-y-2 pt-0.5">
            <Skeleton className={cn("h-5 w-full max-w-[240px]", pulse)} />
            <Skeleton className={cn("h-4 w-full max-w-[180px]", pulse)} />
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Skeleton className={cn("h-6 w-14 rounded-full", pulse)} />
              <Skeleton className={cn("h-6 w-[4.5rem] rounded-full", pulse)} />
              <Skeleton className={cn("h-5 w-24 rounded-md", pulse)} />
            </div>
          </div>
        </div>
        <Skeleton className={cn("size-9 shrink-0 rounded-xl", pulse)} />
      </header>

      <div className="shrink-0 border-b border-slate-200/60 bg-slate-50/90 px-6 py-3">
        <div className="flex flex-wrap gap-2">
          <Skeleton className={cn("h-8 w-[120px] rounded-lg", pulse)} />
          <Skeleton className={cn("h-8 w-28 rounded-lg", pulse)} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-gradient-to-b from-slate-50/80 to-slate-50/40">
        <div className="mx-auto w-full max-w-3xl space-y-6 px-6 py-6">
          <section className="space-y-3">
            <Skeleton className={cn("h-3 w-20", pulse)} />
            <Skeleton className={cn("h-36 w-full rounded-xl", pulse)} />
          </section>

          <Separator className="bg-slate-200/80" />

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Skeleton className={cn("h-3 w-16", pulse)} />
              <Skeleton className={cn("h-8 w-24 rounded-lg", pulse)} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className={cn("h-24 rounded-xl", pulse)} />
              ))}
            </div>
          </section>

          <Separator className="bg-slate-200/80" />

          <section className="space-y-3">
            <Skeleton className={cn("h-3 w-24", pulse)} />
            <Skeleton className={cn("h-28 w-full rounded-xl", pulse)} />
          </section>

          <Separator className="bg-slate-200/80" />

          <section className="space-y-4">
            <Skeleton className={cn("h-3 w-16", pulse)} />
            <Skeleton className={cn("min-h-[80px] w-full rounded-xl", pulse)} />
            <Skeleton className={cn("h-8 w-28 rounded-lg", pulse)} />
          </section>
        </div>
      </div>
    </div>
  );
}
