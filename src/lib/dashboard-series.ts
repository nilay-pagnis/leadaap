import { dayjs } from "@/lib/dayjs-config";

/** Start of UTC day `days` days ago (inclusive window), for `.gte("created_at", …)`. */
export function chartCreatedAtGteIso(days = 14): string {
  return dayjs.utc().subtract(days - 1, "day").startOf("day").toISOString();
}

/**
 * Bucket lead counts by **UTC calendar day** for the last `days` days (inclusive).
 * Aligns with `chartCreatedAtGteIso` + Supabase timestamptz storage.
 */
export function buildDailyLeadSeries(
  rows: { created_at: string }[],
  days = 14
): { iso: string; label: string; count: number }[] {
  const endUtc = dayjs.utc().startOf("day");
  const startUtc = endUtc.subtract(days - 1, "day");

  const counts = new Map<string, number>();
  for (const r of rows) {
    const key = dayjs.utc(r.created_at).format("YYYY-MM-DD");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const out: { iso: string; label: string; count: number }[] = [];
  let cur = startUtc;
  while (!cur.isAfter(endUtc)) {
    const iso = cur.format("YYYY-MM-DD");
    out.push({
      iso,
      count: counts.get(iso) ?? 0,
      label: cur.format("ddd D"),
    });
    cur = cur.add(1, "day");
  }
  return out;
}
