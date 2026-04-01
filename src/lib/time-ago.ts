const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

/**
 * Human-readable relative time (e.g. "2 minutes ago", "yesterday").
 */
export function formatTimeAgo(iso: string | Date): string {
  const then = new Date(iso).getTime();
  const deltaMs = then - Date.now();
  const abs = Math.abs(deltaMs);

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (abs < minute) {
    return rtf.format(Math.round(deltaMs / 1000), "second");
  }
  if (abs < hour) {
    return rtf.format(Math.round(deltaMs / minute), "minute");
  }
  if (abs < day) {
    return rtf.format(Math.round(deltaMs / hour), "hour");
  }
  if (abs < week) {
    return rtf.format(Math.round(deltaMs / day), "day");
  }
  if (abs < month) {
    return rtf.format(Math.round(deltaMs / week), "week");
  }
  if (abs < year) {
    return rtf.format(Math.round(deltaMs / month), "month");
  }
  return rtf.format(Math.round(deltaMs / year), "year");
}
