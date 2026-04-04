import { format, formatDistanceToNow, isValid } from "date-fns";
import { parseTimestamptz } from "@/lib/timestamptz";

/** Relative "time ago" for activity rows; prefer `<ClientRelativeTime />` in UI (SSR-safe). */
export function formatActivityDistanceToNow(iso: string): string {
  const d = parseTimestamptz(iso);
  if (!isValid(d)) return "—";
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatActivityAbsoluteTitle(iso: string): string {
  const d = parseTimestamptz(iso);
  if (!isValid(d)) return iso;
  return format(d, "PPp");
}
