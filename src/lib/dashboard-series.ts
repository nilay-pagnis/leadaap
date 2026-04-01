/** Bucket lead counts by calendar day for the last `days` days (inclusive). */
export function buildDailyLeadSeries(
  rows: { created_at: string }[],
  days = 14
): { iso: string; label: string; count: number }[] {
  const end = new Date();
  end.setHours(12, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const counts = new Map<string, number>();
  for (const r of rows) {
    const d = new Date(r.created_at);
    const key = d.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const out: { iso: string; label: string; count: number }[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    const iso = cur.toISOString().slice(0, 10);
    out.push({
      iso,
      count: counts.get(iso) ?? 0,
      label: cur.toLocaleDateString(undefined, { weekday: "short", day: "numeric" }),
    });
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}
