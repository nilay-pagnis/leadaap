"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LeadsChart({
  series,
  className,
}: {
  series: { iso: string; label: string; count: number }[];
  className?: string;
}) {
  const max = Math.max(1, ...series.map((s) => s.count));
  const total = series.reduce((a, s) => a + s.count, 0);

  if (series.length === 0) {
    return (
      <div
        className={cn(
          "flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/90 bg-slate-50/50 px-6 py-12 text-center",
          className
        )}
      >
        <BarChart3 className="size-9 text-slate-300" aria-hidden />
        <p className="mt-3 text-sm font-medium text-slate-700">No enquiry data yet</p>
        <p className="mt-1 max-w-xs text-xs text-slate-500">
          Submissions will populate this chart automatically.
        </p>
      </div>
    );
  }

  const chartMaxPx = 140;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex h-44 items-end justify-between gap-1 sm:gap-1.5">
        {series.map((d, i) => {
          const barPx = d.count > 0 ? Math.max(4, (d.count / max) * chartMaxPx) : 2;
          return (
            <div
              key={d.iso}
              className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
              title={`${d.count} on ${d.iso}`}
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: barPx }}
                transition={{ duration: 0.45, delay: i * 0.02, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "w-full max-w-[44px] rounded-t-md bg-gradient-to-t from-indigo-600/90 to-indigo-400/80",
                  d.count === 0 && "from-slate-200 to-slate-100"
                )}
              />
              <span className="hidden text-[10px] text-slate-400 sm:block sm:text-[11px]">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span>Last {series.length} days</span>
        <span className="tabular-nums text-slate-700">
          <span className="font-medium">{total}</span> enquiries
        </span>
      </div>
    </div>
  );
}
