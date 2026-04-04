"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LeadScoreLabel, LeadScoreResult } from "@/lib/leads/lead-score";
import { DashboardTooltip } from "@/components/layout/dashboard-tooltip";
import { ScoreBreakdown } from "@/components/leads/score-breakdown";

const LABEL_EMOJI: Record<LeadScoreLabel, string> = {
  Hot: "🔥",
  Warm: "⚡",
  Cold: "❄️",
};

function scoreTooltipLabel(detail: LeadScoreResult, interactive: boolean): string {
  const { score, label, lines, explanation } = detail;
  const top = lines.slice(0, 4).map((l) => `${l.label} +${l.points}`);
  const more =
    lines.length > 4 ? ` · +${lines.length - 4} more signal${lines.length - 4 === 1 ? "" : "s"}` : "";
  const factors = top.length ? top.join(" · ") + more : "No positive signals yet";
  const open = interactive ? " Click for the full breakdown." : "";
  return `${score}/100 (${label}). ${factors}. ${explanation.slice(0, 120)}${explanation.length > 120 ? "…" : ""}${open}`;
}

const toneClass: Record<
  LeadScoreLabel,
  { wrap: string; text: string }
> = {
  Hot: {
    wrap:
      "border-red-200/90 bg-red-50 text-red-800 ring-red-500/10 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200",
    text: "text-red-700 dark:text-red-300",
  },
  Warm: {
    wrap:
      "border-amber-200/90 bg-amber-50 text-amber-950 ring-amber-500/10 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-100",
    text: "text-amber-800 dark:text-amber-200",
  },
  Cold: {
    wrap:
      "border-blue-200/90 bg-blue-50 text-blue-900 ring-blue-500/10 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-100",
    text: "text-blue-800 dark:text-blue-200",
  },
};

export type ScoreBadgeProps = {
  detail: LeadScoreResult;
  size?: "sm" | "md";
  className?: string;
  /** When false, only shows tooltip (no breakdown dialog). */
  interactive?: boolean;
};

/**
 * Color-coded score pill with hover summary and optional click-through breakdown.
 */
export function ScoreBadge({
  detail,
  size = "md",
  className,
  interactive = true,
}: ScoreBadgeProps) {
  const [open, setOpen] = useState(false);
  const { label, score } = detail;
  const emoji = LABEL_EMOJI[label];
  const tone = toneClass[label];

  const tooltip = scoreTooltipLabel(detail, interactive);

  const stopActivate = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (!interactive) return;
      e.stopPropagation();
      setOpen(true);
    },
    [interactive]
  );

  const sharedClass = cn(
    "inline-flex max-w-full items-center gap-1 rounded-full border font-semibold tabular-nums shadow-sm ring-1 transition-colors",
    tone.wrap,
    size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
    interactive &&
      "cursor-pointer outline-none hover:brightness-[0.98] focus-visible:ring-2 focus-visible:ring-slate-400/50 dark:hover:brightness-110",
    className
  );

  const labelPart = (
    <>
      <span aria-hidden>{emoji}</span>
      <span className={cn("min-w-0 truncate", tone.text)}>{score}</span>
      <span className={cn("font-medium opacity-90", tone.text)}>({label})</span>
    </>
  );

  const inner =
    interactive ? (
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className={sharedClass}
        onPointerDown={stopActivate}
        onClick={onClick}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {labelPart}
      </motion.button>
    ) : (
      <span className={sharedClass}>{labelPart}</span>
    );

  return (
    <>
      <DashboardTooltip
        label={tooltip}
        side="top"
        className="max-w-full"
        tooltipClassName="whitespace-normal max-w-[min(100vw-2rem,280px)] text-left"
      >
        {inner}
      </DashboardTooltip>
      {interactive ? (
        <ScoreBreakdown open={open} onOpenChange={setOpen} detail={detail} />
      ) : null}
    </>
  );
}
