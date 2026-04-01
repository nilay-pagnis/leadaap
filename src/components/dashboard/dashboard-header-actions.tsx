"use client";

import { useEffect } from "react";
import { useUiStore } from "@/stores/ui-store";

/**
 * Mount anywhere in a dashboard page to render actions in the sticky top bar (right side).
 */
export function DashboardHeaderActions({ children }: { children: React.ReactNode }) {
  const set = useUiStore((s) => s.setDashboardHeaderActions);
  useEffect(() => {
    set(children);
    return () => set(null);
  }, [children, set]);
  return null;
}
