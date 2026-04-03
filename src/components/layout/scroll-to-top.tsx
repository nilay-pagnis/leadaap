"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD_PX = 300;

export type ScrollToTopProps = {
  className?: string;
  /** Scroll position past which the button appears (default 300). */
  threshold?: number;
};

export function ScrollToTop({ className, threshold = SCROLL_THRESHOLD_PX }: ScrollToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <AnimatePresence mode="wait">
      {visible ? (
        <motion.button
          key="scroll-to-top"
          type="button"
          aria-label="Scroll to top"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.88 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          className={cn(
            "fixed z-30 flex size-12 items-center justify-center rounded-full sm:size-[3.25rem]",
            "border border-slate-200/90 bg-white text-slate-700 shadow-lg shadow-slate-900/12",
            "ring-1 ring-slate-900/[0.04] transition-shadow duration-200",
            "hover:shadow-xl hover:shadow-slate-900/18 hover:ring-slate-900/[0.06]",
            "dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:shadow-black/30 dark:ring-white/10",
            "max-sm:bottom-[max(1.25rem,env(safe-area-inset-bottom,0px))]",
            "max-sm:right-[max(1.25rem,env(safe-area-inset-right,0px))]",
            "sm:bottom-7 sm:right-7 md:bottom-8 md:right-8",
            className
          )}
        >
          <ArrowUp className="size-5 sm:size-[1.35rem]" strokeWidth={2.25} aria-hidden />
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
