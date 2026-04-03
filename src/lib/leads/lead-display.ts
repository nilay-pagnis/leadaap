import type { LeadFieldDef, LeadRow } from "@/types";

const NAME_LIKE = /name|full name|first name/i;

/** Field ids used for name/email search (aligned with leadMatchesNameOrEmail). */
export function getNameEmailSearchFieldIds(
  fieldDefs: LeadFieldDef[],
  formId: string
): string[] {
  const defs = fieldDefs.filter((f) => f.form_id === formId);
  const emailIds = defs.filter((f) => f.type === "email").map((f) => f.id);
  const nameTextIds = defs
    .filter((f) => f.type === "text" && NAME_LIKE.test(f.label))
    .map((f) => f.id);

  let candidateIds = Array.from(new Set([...emailIds, ...nameTextIds]));
  if (candidateIds.length === 0) {
    candidateIds = defs.filter((f) => f.type === "text").map((f) => f.id);
  }
  return candidateIds;
}

function firstNonEmptyString(
  lead: LeadRow,
  fieldIds: string[]
): string {
  for (const id of fieldIds) {
    const v = lead.data?.[id];
    if (typeof v === "string") {
      const t = v.trim();
      if (t) return t;
    }
  }
  return "—";
}

/**
 * Display name and email for cards/summaries using form field metadata.
 */
export function getLeadNameAndEmail(
  lead: LeadRow,
  fieldDefs: LeadFieldDef[]
): { name: string; email: string } {
  const defs = fieldDefs.filter((f) => f.form_id === lead.form_id);
  const emailFields = defs.filter((f) => f.type === "email");
  const nameLikeText = defs.filter(
    (f) => f.type === "text" && NAME_LIKE.test(f.label)
  );
  const textFallback =
    nameLikeText.length > 0
      ? nameLikeText
      : defs.filter((f) => f.type === "text");

  const email = firstNonEmptyString(
    lead,
    emailFields.map((f) => f.id)
  );
  const name = firstNonEmptyString(
    lead,
    textFallback.map((f) => f.id)
  );

  return { name, email };
}
