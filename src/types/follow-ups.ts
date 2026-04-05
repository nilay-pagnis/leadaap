export type FollowUpStatus = "pending" | "notified" | "dismissed" | "completed";

export type FollowUpRow = {
  id: string;
  user_id: string;
  lead_id: string;
  remind_at: string;
  status: FollowUpStatus;
  note: string | null;
  created_at: string;
  notified_at: string | null;
};

/** Earliest pending reminder per lead for inbox highlighting (overdue computed in UI with `timeTick`). */
export type FollowUpDueInfo = {
  remindAt: string;
};
