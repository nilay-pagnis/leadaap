"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight tooltip for icon buttons (hover + keyboard focus).
 */
export function DashboardTooltip({
  label,
  children,
  side = "bottom",
  className,
  tooltipClassName,
}: {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
  className?: string;
  /** e.g. `whitespace-normal max-w-xs` for multi-line tooltips */
  tooltipClassName?: string;
}) {
  return (
    <span className={cn("group/tooltip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-[60] -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1.5 text-[11px] font-medium leading-snug text-white opacity-0 shadow-md transition-opacity duration-150",
          "group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
          side === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
          tooltipClassName
        )}
      >
        {label}
      </span>
    </span>
  );
}
