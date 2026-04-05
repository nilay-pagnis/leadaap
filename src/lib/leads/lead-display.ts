import type { LeadFieldDef, LeadRow } from "@/types";

const NAME_LIKE = /name|full name|first name/i;

/** Field ids used for name/email search (aligned with leadMatchesNameOrEmail). */
export function getNameEmailSearchFieldIds(
  fieldDefs: LeadFieldDef[],
  formId: string | null
): string[] {
  if (formId == null || formId === "") return [];
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
  const fid = lead.form_id;
  if (fid == null || fid === "") {
    const name =
      typeof lead.data?.name === "string" && lead.data.name.trim()
        ? lead.data.name.trim()
        : "—";
    const email =
      typeof lead.data?.email === "string" && lead.data.email.trim()
        ? lead.data.email.trim()
        : "—";
    return { name, email };
  }

  const defs = fieldDefs.filter((f) => f.form_id === fid);
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

/** Raw phone string for links / alerts, or empty if none. */
export function getLeadPhoneNumber(
  lead: LeadRow,
  fieldDefs: LeadFieldDef[]
): string {
  if (lead.form_id == null || lead.form_id === "") {
    const v = lead.data?.phone;
    return typeof v === "string" && v.trim() ? v.trim() : "";
  }
  const defs = fieldDefs.filter(
    (f) => f.form_id === lead.form_id && f.type === "phone"
  );
  for (const f of defs) {
    const v = lead.data?.[f.id];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

/**
 * Best-effort display name when only `leads.data` is available (e.g. cron without field defs).
 */
export function getLeadShortLabelFromData(
  data: Record<string, unknown> | null | undefined
): string {
  if (!data) return "Lead";
  const n = data.name;
  if (typeof n === "string") {
    const t = n.trim();
    if (t) return t.slice(0, 80);
  }
  for (const v of Object.values(data)) {
    if (typeof v === "string") {
      const t = v.trim();
      if (t && !t.includes("@") && t.length < 120) return t.slice(0, 80);
    }
  }
  return "Lead";
}
