import { isPaidPlan, normalizePlanId } from "@/lib/monetization/plans";

/**
 * Paid plans unlock full inbox: Kanban drag-and-drop, custom column order,
 * numeric lead score + breakdown / insights. Free keeps core inbox value
 * (list, board view, status changes via panel, label-only temperature).
 */
export function hasPaidInboxFeatures(plan: unknown): boolean {
  return isPaidPlan(normalizePlanId(plan));
}
