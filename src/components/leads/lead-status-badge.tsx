import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/types";

const styles: Record<LeadStatus, string> = {
  new: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/40 dark:bg-blue-950/50 dark:text-blue-300",
  contacted:
    "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-500/35 dark:bg-yellow-950/40 dark:text-yellow-200",
  closed:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/35 dark:bg-emerald-950/40 dark:text-emerald-300",
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
        "inline-flex items-center rounded-full border font-medium capitalize tracking-wide transition-colors",
        size === "md"
          ? "px-3 py-1 text-sm"
          : "px-2.5 py-0.5 text-xs",
        styles[status],
        className
      )}
    >
      {status}
    </span>
  );
}
