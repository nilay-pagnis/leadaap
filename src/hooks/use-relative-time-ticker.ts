"use client";

import { useEffect, useState } from "react";

/** Re-renders periodically so relative time strings stay fresh (e.g. every minute). */
export function useRelativeTimeTicker(active: boolean, intervalMs = 60_000) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [active, intervalMs]);
  return tick;
}
