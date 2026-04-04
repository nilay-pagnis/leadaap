"use client";

import { useEffect, useState } from "react";
import { format, formatDistanceToNow, isValid } from "date-fns";
import { parseTimestamptz } from "@/lib/timestamptz";

type Props = {
  iso: string;
  className?: string;
  /** Increment periodically (e.g. from `useRelativeTimeTicker`) to refresh copy. */
  tick?: number;
  /** If true, sets `title` to a full local date/time after mount (for hover). */
  absoluteTitle?: boolean;
};

/**
 * Relative "time ago" in the browser's locale/timezone. Defers formatting until
 * after mount so SSR does not freeze UTC-relative labels.
 */
export function ClientRelativeTime({
  iso,
  className,
  tick = 0,
  absoluteTitle,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  void tick;

  let text: string | null = null;
  let title: string | undefined;
  if (mounted) {
    const d = parseTimestamptz(iso);
    if (!isValid(d)) {
      text = "—";
    } else {
      text = formatDistanceToNow(d, { addSuffix: true });
      title = absoluteTitle ? format(d, "PPp") : undefined;
    }
  }

  return (
    <time dateTime={iso} className={className} title={title} suppressHydrationWarning>
      {text ?? "…"}
    </time>
  );
}
