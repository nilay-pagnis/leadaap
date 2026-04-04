"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { LeadScoreLabel, LeadScoreResult } from "@/lib/leads/lead-score";

const labelEmoji: Record<LeadScoreLabel, string> = {
  Hot: "🔥",
  Warm: "⚡",
  Cold: "❄️",
};

const labelAccent: Record<LeadScoreLabel, string> = {
  Hot: "text-red-600 dark:text-red-400",
  Warm: "text-amber-600 dark:text-amber-400",
  Cold: "text-blue-600 dark:text-blue-400",
};

export type ScoreBreakdownProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: LeadScoreResult;
};

/**
 * Modal with line-by-line score factors and explanation copy.
 */
export function ScoreBreakdown({
  open,
  onOpenChange,
  detail,
}: ScoreBreakdownProps) {
  const { score, label, lines, explanation } = detail;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "max-h-[min(90vh,520px)] gap-0 overflow-hidden rounded-2xl border-slate-200/90 p-0 shadow-xl sm:max-w-md"
        )}
      >
        <DialogHeader className="space-y-2 border-b border-slate-100 bg-slate-50/80 px-6 py-5 text-left">
          <DialogTitle className="text-base font-semibold tracking-tight text-slate-900">
            Lead score
          </DialogTitle>
          <DialogDescription className="sr-only">
            Breakdown of how this lead score was calculated from enquiry signals.
          </DialogDescription>
          <div className="flex flex-wrap items-baseline gap-2">
            <span
              className={cn(
                "text-3xl font-bold tabular-nums tracking-tight text-slate-900",
                labelAccent[label]
              )}
            >
              {score}
            </span>
            <span className="text-lg font-medium text-slate-500">/ 100</span>
            <span className={cn("text-lg font-semibold", labelAccent[label])}>
              <span aria-hidden>{labelEmoji[label]} </span>
              {label}
            </span>
          </div>
        </DialogHeader>

        <div className="max-h-[min(50vh,280px)] overflow-y-auto px-6 py-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            How we scored this
          </p>
          <ul className="space-y-2">
            {lines.map((line, i) => (
              <li
                key={`${line.label}-${i}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white px-3 py-2.5 text-sm shadow-sm ring-1 ring-slate-900/[0.03]"
              >
                <span className="min-w-0 text-slate-700">{line.label}</span>
                <span className="shrink-0 font-semibold tabular-nums text-slate-900">
                  +{line.points}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/90 px-6 py-4">
          <p className="text-sm leading-relaxed text-slate-600">{explanation}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
