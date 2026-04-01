import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/types";

const styles: Record<LeadStatus, string> = {
  new: "border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-200",
  contacted:
    "border-amber-200/90 bg-amber-50 text-amber-950 dark:border-amber-500/35 dark:bg-amber-950/40 dark:text-amber-200",
  qualified:
    "border-violet-200/90 bg-violet-50 text-violet-900 dark:border-violet-500/35 dark:bg-violet-950/40 dark:text-violet-200",
  closed:
    "border-emerald-200/90 bg-emerald-50 text-emerald-900 dark:border-emerald-500/35 dark:bg-emerald-950/40 dark:text-emerald-300",
};

const labels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  closed: "Closed",
};

export function LeadStatusBadge({
  status,
  className,
  size = "sm",
}: {
  status: LeadStatus;
  className?: string;
  /** sm: compact (table), md: CRM modal — px-3 py-1 text-sm rounded-full */
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium tracking-wide transition-colors",
        size === "md" ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs",
        styles[status],
        className
      )}
    >
      {labels[status]}
    </span>
  );
}
