"use client";

import { ArrowRightLeft, Inbox, Loader2 } from "lucide-react";
import { ClientRelativeTime } from "@/components/ui/client-relative-time";
import { cn } from "@/lib/utils";
import { formatActivityMessage } from "@/lib/leads/activity-messages";
import type { LeadActivity, LeadActivityType } from "@/types";

function activityIcon(type: LeadActivityType) {
  const cls = "size-3.5 shrink-0 text-slate-500";
  switch (type) {
    case "created":
      return <Inbox className={cls} aria-hidden />;
    case "status_change":
      return <ArrowRightLeft className={cls} aria-hidden />;
    default:
      return null;
  }
}

export type ActivityFeedProps = {
  items: LeadActivity[];
  loading: boolean;
  emptyLabel?: string;
  className?: string;
  /** From `useRelativeTimeTicker` so “time ago” updates while the panel is open. */
  timeTick: number;
};

/** Activity stream (created + status_change only). Data from `useLeadActivities`.activityItems */
export function ActivityFeed({
  items,
  loading,
  emptyLabel = "No activity yet.",
  className,
  timeTick,
}: ActivityFeedProps) {
  return (
    <div className={cn(className)}>
      {loading ? (
        <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-3 py-2.5 text-sm text-slate-500 shadow-sm">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading…
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200/90 bg-white/80 px-3 py-4 text-sm text-slate-500">
          {emptyLabel}
        </p>
      ) : (
        <div className="relative rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.03]">
          <div
            className="absolute bottom-6 left-8 top-10 w-px bg-gradient-to-b from-slate-200 via-slate-200 to-transparent"
            aria-hidden
          />
          <ul className="relative m-0 list-none space-y-0 p-0">
            {items.map((activity, i) => (
              <li
                key={activity.id}
                className="relative flex gap-3.5 pb-6 pl-0 last:pb-0"
              >
                <div className="relative z-[1] flex shrink-0 justify-center pt-0.5">
                  <span className="flex size-8 items-center justify-center rounded-full border border-slate-200/90 bg-gradient-to-b from-white to-slate-50 shadow-sm ring-2 ring-white">
                    <span className="flex size-2 rounded-full bg-slate-400 shadow-[0_0_0_3px_rgba(255,255,255,1)]" />
                  </span>
                </div>
                <div
                  className={cn(
                    "min-w-0 flex-1 rounded-lg px-1 py-0.5 transition-colors duration-200",
                    "hover:bg-slate-50/90",
                    i === 0 && "pt-0"
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 opacity-90">{activityIcon(activity.type)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-relaxed text-slate-800">
                        {formatActivityMessage(activity)}
                      </p>
                      <ClientRelativeTime
                        iso={activity.created_at}
                        className="mt-1.5 block text-xs font-medium text-slate-500"
                        tick={timeTick}
                        absoluteTitle
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
