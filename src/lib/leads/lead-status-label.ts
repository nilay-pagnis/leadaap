import type { LeadStatus } from "@/types";

export function leadStatusLabel(s: LeadStatus): string {
  switch (s) {
    case "new":
      return "New";
    case "contacted":
      return "Contacted";
    case "qualified":
      return "Qualified";
    case "closed":
      return "Closed";
    default:
      return s;
  }
}
