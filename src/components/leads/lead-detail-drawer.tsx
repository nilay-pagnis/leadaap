"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function LeadDetailDrawer({ open, onClose, title, subtitle, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

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
            className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-[2px] transition-opacity"
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
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col rounded-l-2xl border-l border-slate-200/90 bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.04)]"
          >
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div className="min-w-0">
                <h2
                  id="lead-drawer-title"
                  className="text-lg font-semibold tracking-tight text-slate-900"
                >
                  {title}
                </h2>
                {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                onClick={onClose}
              >
                <X className="size-5" />
                <span className="sr-only">Close</span>
              </Button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-6">
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
