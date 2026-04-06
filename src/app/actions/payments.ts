"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserIsAdmin } from "@/lib/admin/get-current-user-admin";
import { isPaidPlan, normalizePlanId, PLAN_LIMITS } from "@/lib/monetization/plans";
import type { PlanId } from "@/types/billing";

export type PaymentActionResult =
  | { ok: true }
  | { ok: false; error: string };

async function requireAdmin(): Promise<boolean> {
  return getCurrentUserIsAdmin();
}

export async function approvePaymentAction(
  paymentRowId: string
): Promise<PaymentActionResult> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "Not authorized" };
  }

  const admin = createAdminClient();

  const { data: row, error: fetchErr } = await admin
    .from("payments")
    .select("id, user_id, plan, status")
    .eq("id", paymentRowId)
    .maybeSingle();

  if (fetchErr || !row) {
    return { ok: false, error: "Payment not found" };
  }

  if (row.status !== "pending") {
    return { ok: false, error: "Already processed" };
  }

  const plan = normalizePlanId(row.plan) as PlanId;
  if (!isPaidPlan(plan)) {
    return { ok: false, error: "Invalid plan on record" };
  }

  const credits = PLAN_LIMITS[plan].creditAllocation;

  const { data: profileBefore, error: profFetchErr } = await admin
    .from("profiles")
    .select("plan, credits")
    .eq("id", row.user_id)
    .maybeSingle();

  if (profFetchErr) {
    return { ok: false, error: profFetchErr.message };
  }

  const prevPlan =
    typeof (profileBefore as { plan?: string } | null)?.plan === "string"
      ? (profileBefore as { plan: string }).plan
      : "free";
  const prevCredits =
    typeof (profileBefore as { credits?: number } | null)?.credits === "number"
      ? (profileBefore as { credits: number }).credits
      : 0;

  const { error: profErr } = await admin
    .from("profiles")
    .update({
      plan,
      credits,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.user_id);

  if (profErr) {
    console.error("[approvePaymentAction] profile update failed", profErr);
    return { ok: false, error: profErr.message };
  }

  const { error: payErr } = await admin
    .from("payments")
    .update({
      status: "approved",
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentRowId)
    .eq("status", "pending");

  if (payErr) {
    const { error: revertErr } = await admin
      .from("profiles")
      .update({
        plan: prevPlan,
        credits: prevCredits,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.user_id);
    if (revertErr) {
      console.error(
        "[approvePaymentAction] CRITICAL: payment update failed and profile revert failed",
        payErr,
        revertErr
      );
      return {
        ok: false,
        error:
          "Could not finalize payment record; workspace plan may need manual review.",
      };
    }
    console.error(
      "[approvePaymentAction] payment row update failed; profile reverted",
      payErr
    );
    return { ok: false, error: payErr.message };
  }

  console.info("[approvePaymentAction] approved", {
    paymentRowId,
    userId: row.user_id,
    plan,
  });

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function rejectPaymentAction(
  paymentRowId: string
): Promise<PaymentActionResult> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "Not authorized" };
  }

  const admin = createAdminClient();

  const { data: row, error: fetchErr } = await admin
    .from("payments")
    .select("id, status")
    .eq("id", paymentRowId)
    .maybeSingle();

  if (fetchErr || !row) {
    return { ok: false, error: "Payment not found" };
  }

  if (row.status !== "pending") {
    return { ok: false, error: "Already processed" };
  }

  const { error } = await admin
    .from("payments")
    .update({
      status: "rejected",
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentRowId)
    .eq("status", "pending");

  if (error) {
    console.error("[rejectPaymentAction] update failed", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
