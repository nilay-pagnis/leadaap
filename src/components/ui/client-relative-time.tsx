"use client";

import { useEffect, useState } from "react";
import { dayjs } from "@/lib/dayjs-config";
import { parseTimestamptz } from "@/lib/timestamptz";

type Props = {
  iso: string;
  className?: string;
  /** Increment periodically (e.g. from `useRelativeTimeTicker`) to refresh copy. */
  tick?: number;
  /** If true, sets `title` to a full local date/time after mount (for hover). */
  absoluteTitle?: boolean;
  /**
   * `combined` → "2 minutes ago • 5:10 PM" (local). `relative` → fromNow() only.
   */
  variant?: "relative" | "combined";
};

/**
 * Relative time via dayjs (local timezone). Defers formatting until after mount
 * so SSR does not freeze labels.
 */
export function ClientRelativeTime({
  iso,
  className,
  tick = 0,
  absoluteTitle,
  variant = "combined",
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  void tick;

  let text: string | null = null;
  let title: string | undefined;
  if (mounted) {
    const d = dayjs(parseTimestamptz(iso));
    if (!d.isValid()) {
      text = "—";
    } else {
      const rel = d.fromNow();
      const clock = d.format("h:mm A");
      text =
        variant === "combined" ? `${rel} • ${clock}` : rel;
      title = absoluteTitle
        ? d.format("dddd, MMMM D, YYYY [at] h:mm A")
        : undefined;
    }
  }

  return (
    <time dateTime={iso} className={className} title={title} suppressHydrationWarning>
      {text ?? "…"}
    </time>
  );
}
