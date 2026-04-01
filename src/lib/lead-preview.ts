/** Short preview string from lead submission JSON for search / lists. */
export function formatLeadPreview(data: Record<string, unknown>): string {
  const vals = Object.values(data)
    .filter((v) => typeof v === "string" && v.trim())
    .slice(0, 2) as string[];
  return vals.join(" · ") || "Lead";
}
