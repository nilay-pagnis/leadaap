import type { LeadRow } from "@/types";
import { MANUAL_SOURCE_OPTIONS } from "@/lib/leads/build-manual-lead-data";

/** Select value for “Manual Entry” in the enquiries Form filter (not a real form id). */
export const MANUAL_ENTRY_FORM_FILTER = "__manual_entry__" as const;

const MANUAL_SOURCE_SLUGS = new Set(
  MANUAL_SOURCE_OPTIONS.map((o) => o.value.toLowerCase())
);

/** True when this lead was added via Add Enquiry Manually (any manual source). */
export function isManualEnquiryLead(lead: LeadRow): boolean {
  const src = lead.data?.source;
  if (typeof src !== "string") return false;
  return MANUAL_SOURCE_SLUGS.has(src.trim().toLowerCase());
}
