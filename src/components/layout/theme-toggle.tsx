"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardTooltip } from "@/components/layout/dashboard-tooltip";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");

  const toggle = useCallback(() => {
    setTheme(isDark ? "light" : "dark");
  }, [isDark, setTheme]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggle();
      }
    },
    [toggle]
  );

  return (
    <DashboardTooltip label="Toggle theme">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        aria-pressed={isDark}
        className={cn(
          "relative size-9 shrink-0 rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
          className
        )}
        onClick={toggle}
        onKeyDown={onKeyDown}
      >
        <span className="sr-only">Toggle theme</span>
        <AnimatePresence mode="wait" initial={false}>
          {mounted && isDark ? (
            <motion.span
              key="moon"
              initial={{ opacity: 0, rotate: -90, scale: 0.85 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.85 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
              aria-hidden
            >
              <Moon className="size-[18px]" />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ opacity: 0, rotate: 90, scale: 0.85 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.85 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
              aria-hidden
            >
              <Sun className="size-[18px]" />
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </DashboardTooltip>
  );
}
