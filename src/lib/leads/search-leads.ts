import type { LeadFieldDef, LeadRow } from "@/types";

const NAME_LIKE = /name|full name|first name/i;

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

  const defs = fieldDefs.filter((f) => f.form_id === lead.form_id);
  const emailIds = defs.filter((f) => f.type === "email").map((f) => f.id);
  const nameTextIds = defs
    .filter((f) => f.type === "text" && NAME_LIKE.test(f.label))
    .map((f) => f.id);

  let candidateIds = Array.from(new Set([...emailIds, ...nameTextIds]));
  if (candidateIds.length === 0) {
    candidateIds = defs.filter((f) => f.type === "text").map((f) => f.id);
  }

  for (const id of candidateIds) {
    const v = lead.data?.[id];
    if (typeof v === "string" && v.toLowerCase().includes(q)) return true;
  }
  return false;
}
