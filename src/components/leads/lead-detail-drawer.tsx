"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const bodyInnerClass =
  "mx-auto w-full max-w-3xl space-y-6 px-6 py-6";

type Props = {
  open: boolean;
  onClose: () => void;
  /** When set, replaces default title/subtitle header. */
  header?: ReactNode;
  /** Sticky action row below header (status, actions). */
  toolbar?: ReactNode;
  /** Used when `header` is not provided. */
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  /**
   * `overlay` — modal-style slide-in with backdrop (default).
   * `embedded` — full-height column for split-view layouts (no backdrop).
   */
  variant?: "overlay" | "embedded";
};

export function LeadDetailDrawer({
  open,
  onClose,
  header,
  toolbar,
  title,
  subtitle,
  children,
  variant = "overlay",
}: Props) {
  const embedded = variant === "embedded";

  useEffect(() => {
    if (!open || embedded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, embedded]);

  useEffect(() => {
    if (!open || embedded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, embedded]);

  if (embedded && !open) return null;

  if (embedded) {
    return (
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-drawer-title"
        className="flex h-full min-h-0 w-full min-w-0 flex-col bg-white shadow-[inset_1px_0_0_rgba(15,23,42,0.04)]"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200/70 bg-white px-6 py-5 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
          {header ? (
            <div className="min-w-0 flex-1">{header}</div>
          ) : (
            <div className="min-w-0">
              <h2
                id="lead-drawer-title"
                className="text-lg font-semibold tracking-tight text-slate-900"
              >
                {title ?? "Details"}
              </h2>
              {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            onClick={onClose}
          >
            <X className="size-5" />
            <span className="sr-only">Close</span>
          </Button>
        </header>
        {toolbar ? (
          <div className="shrink-0 border-b border-slate-200/60 bg-slate-50/90 px-6 py-3">
            {toolbar}
          </div>
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-slate-50/80 to-slate-50/40">
          <div className={bodyInnerClass}>{children}</div>
        </div>
      </aside>
    );
  }

  return (
    <AnimatePresence mode="sync">
      {open && (
        <>
          <motion.button
            key="lead-drawer-overlay"
            type="button"
            aria-label="Close drawer overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-slate-900/15 backdrop-blur-[2px] transition-opacity"
            onClick={onClose}
          />
          <motion.aside
            key="lead-drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-drawer-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            className={cn(
              "fixed right-0 top-0 z-50 flex h-full max-h-dvh w-full flex-col rounded-none",
              "max-w-[min(100vw,48rem)] border-l border-slate-200/70 bg-white shadow-[0_25px_50px_-12px_rgba(15,23,42,0.15),0_0_0_1px_rgba(15,23,42,0.04)]"
            )}
          >
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200/70 bg-white px-6 py-5 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
              {header ? (
                <div className="min-w-0 flex-1">{header}</div>
              ) : (
                <div className="min-w-0">
                  <h2
                    id="lead-drawer-title"
                    className="text-lg font-semibold tracking-tight text-slate-900"
                  >
                    {title ?? "Details"}
                  </h2>
                  {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
                </div>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0 rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                onClick={onClose}
              >
                <X className="size-5" />
                <span className="sr-only">Close</span>
              </Button>
            </header>
            {toolbar ? (
              <div className="shrink-0 border-b border-slate-200/60 bg-slate-50/90 px-6 py-3">
                {toolbar}
              </div>
            ) : null}
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-slate-50/80 to-slate-50/40">
              <div className={bodyInnerClass}>{children}</div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
