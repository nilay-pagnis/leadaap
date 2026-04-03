import type { LeadFieldDef, LeadRow } from "@/types";
import { getNameEmailSearchFieldIds } from "@/lib/leads/lead-display";

/**
 * True if query is empty, or if query appears in email / name-like text values
 * for this lead's form (per fieldDefs).
 */
export function leadMatchesNameOrEmail(
  lead: LeadRow,
  fieldDefs: LeadFieldDef[],
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const candidateIds = getNameEmailSearchFieldIds(fieldDefs, lead.form_id);

  for (const id of candidateIds) {
    const v = lead.data?.[id];
    if (typeof v === "string" && v.toLowerCase().includes(q)) return true;
  }
  return false;
}
