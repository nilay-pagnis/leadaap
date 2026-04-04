import type { LeadRow } from "@/types";

/** Virtual form id for “Manual Entry” in dropdowns and filters (not a DB form row). */
export const MANUAL_VIRTUAL_FORM_ID = "manual" as const;

/** Canonical virtual form row for UI lists (add enquiry + filters). */
export const VIRTUAL_MANUAL_FORM = {
  id: MANUAL_VIRTUAL_FORM_ID,
  name: "Manual Entry",
} as const;

/** @deprecated alias — use MANUAL_VIRTUAL_FORM_ID */
export const MANUAL_ENTRY_FORM_FILTER = MANUAL_VIRTUAL_FORM_ID;

/** True when this enquiry has no linked form (standalone manual pipeline). */
export function isManualEnquiryLead(lead: LeadRow): boolean {
  return lead.form_id == null || lead.form_id === "";
}
