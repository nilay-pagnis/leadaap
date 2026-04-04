"use client";

import { useEffect, useState } from "react";
import { parseTimestamptz } from "@/lib/timestamptz";

/**
 * Formats an instant in the viewer's local timezone. Renders after mount so
 * Next.js SSR (Node in UTC) never shows the wrong wall clock.
 */
export function ClientLocalDateTime({
  iso,
  className,
}: {
  iso: string;
  className?: string;
}) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const d = parseTimestamptz(iso);
    if (Number.isNaN(d.getTime())) {
      setText("—");
      return;
    }
    setText(
      d.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "medium",
      })
    );
  }, [iso]);

  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {text ?? "…"}
    </time>
  );
}
