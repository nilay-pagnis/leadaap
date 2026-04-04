import type { LeadRow } from "@/types";
import { MANUAL_SOURCE_OPTIONS } from "@/lib/leads/build-manual-lead-data";

const MANUAL_SLUGS = new Set(
  MANUAL_SOURCE_OPTIONS.map((o) => o.value.toLowerCase())
);

/** Values supported by `SourceBadge` (maps from `lead.data.source`). */
export type LeadSourceBadgeKind =
  | "manual"
  | "form"
  | "call"
  | "whatsapp"
  | "referral"
  | "other";

export function normalizeLeadDataSource(raw: unknown): LeadSourceBadgeKind {
  if (typeof raw !== "string") return "form";
  const s = raw.trim().toLowerCase();
  if (!s) return "form";
  if (MANUAL_SLUGS.has(s)) return s as LeadSourceBadgeKind;
  if (s === "form") return "form";
  return "other";
}

function resolvedFormTitle(
  formNames: Record<string, string>,
  formId: string | null
): string {
  if (formId == null || formId === "") return "";
  const raw = formNames[formId];
  return typeof raw === "string" && raw.trim() ? raw.trim() : "";
}

/**
 * Primary label + badge kind for “where this enquiry came from”.
 * - `manual` with no form name → title "Manual Entry"
 * - `manual` with form → form name + Manual badge
 * - `form` / default → form name + Form badge
 */
export function getEnquiryFormSourceDisplay(
  lead: LeadRow,
  formNames: Record<string, string>
): { title: string; source: LeadSourceBadgeKind } {
  const slug = normalizeLeadDataSource(lead.data?.source);
  const formTitle = resolvedFormTitle(formNames, lead.form_id);
  const noLinkedForm = lead.form_id == null || lead.form_id === "";

  if (noLinkedForm) {
    if (slug === "manual") {
      return { title: "Manual Entry", source: "manual" };
    }
    if (MANUAL_SLUGS.has(String(lead.data?.source ?? "").trim().toLowerCase())) {
      return { title: "Manual Entry", source: slug };
    }
    return { title: "Unknown", source: "other" };
  }

  if (slug === "manual") {
    if (!formTitle) {
      return { title: "Manual Entry", source: "manual" };
    }
    return { title: formTitle, source: "manual" };
  }

  if (slug === "form") {
    return { title: formTitle || "—", source: "form" };
  }

  if (slug === "other") {
    return { title: formTitle || "—", source: "other" };
  }

  return { title: formTitle || "—", source: slug };
}
