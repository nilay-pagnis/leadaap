"use client";

import { motion } from "framer-motion";

type ProgressBarProps = {
  /** 0–1 */
  progress: number;
  className?: string;
};

/**
 * Thin top progress bar — width animates with step progress (Stitch-style).
 */
export function ProgressBar({ progress, className }: ProgressBarProps) {
  const p = Math.min(1, Math.max(0, progress));
  return (
    <div
      className={
        className ??
        "pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-slate-200/90"
      }
      role="progressbar"
      aria-valuenow={Math.round(p * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full w-full origin-left bg-gradient-to-r from-[#4F46E5] via-[#5B52E8] to-[#6366F1]"
        initial={false}
        animate={{ scaleX: p }}
        transition={{ type: "spring", stiffness: 140, damping: 28 }}
      />
    </div>
  );
}
