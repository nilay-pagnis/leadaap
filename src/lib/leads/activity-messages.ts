import type { LeadActivity, LeadStatus } from "@/types";

export function statusActivityLabel(s: LeadStatus): string {
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

function isStatusPayload(
  p: LeadActivity["payload"]
): p is { from: LeadStatus; to: LeadStatus } {
  return (
    typeof p === "object" &&
    p !== null &&
    "from" in p &&
    "to" in p &&
    typeof (p as { from: unknown }).from === "string" &&
    typeof (p as { to: unknown }).to === "string"
  );
}

function isNotePayload(p: LeadActivity["payload"]): p is { body: string } {
  return (
    typeof p === "object" &&
    p !== null &&
    "body" in p &&
    typeof (p as { body: unknown }).body === "string"
  );
}

/** Single-line preview for note body in timeline */
function notePreview(body: string, maxLen = 120): string {
  const line = body.trim().split(/\r?\n/)[0] ?? "";
  if (line.length <= maxLen) return line;
  return `${line.slice(0, maxLen - 1)}…`;
}

export function formatActivityMessage(activity: LeadActivity): string {
  switch (activity.type) {
    case "created":
      return "New enquiry received";
    case "status_change": {
      if (!isStatusPayload(activity.payload)) {
        return "Status updated";
      }
      return `Status changed to ${statusActivityLabel(activity.payload.to)}`;
    }
    case "note": {
      if (!isNotePayload(activity.payload) || !activity.payload.body.trim()) {
        return "Added a note";
      }
      return `Added note: ${notePreview(activity.payload.body)}`;
    }
    default:
      return "Activity";
  }
}
