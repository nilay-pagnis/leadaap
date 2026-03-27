"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserIsAdmin } from "@/lib/admin/get-current-user-admin";
import { normalizePlanId, PLAN_LIMITS } from "@/lib/monetization/plans";
import type { PlanId } from "@/types/billing";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

async function requireAdmin(): Promise<boolean> {
  return getCurrentUserIsAdmin();
}

/** Add (or subtract) credits via RPC — enforces admin in the database. */
export async function adminIncrementCreditsAction(
  userId: string,
  amount: number
): Promise<AdminActionResult> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "Not authorized" };
  }
  if (!userId || !Number.isFinite(amount) || amount === 0) {
    return { ok: false, error: "Invalid input" };
  }
  const delta = Math.trunc(amount);

  const supabase = await createClient();
  const { error } = await supabase.rpc("increment_credits", {
    p_user_id: userId,
    p_amount: delta,
  });

  if (error) {
    if (error.message.includes("forbidden") || error.code === "P0001") {
      return { ok: false, error: "Not authorized" };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

/** Set user plan and reset credits to plan allocation (admin). */
export async function adminSetPlanAction(
  userId: string,
  planRaw: string
): Promise<AdminActionResult> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "Not authorized" };
  }
  const plan = normalizePlanId(planRaw) as PlanId;
  const admin = createAdminClient();

  const patch: {
    plan: PlanId;
    credits: number;
    trial_ends_at: string | null;
    updated_at: string;
  } = {
    plan,
    credits: PLAN_LIMITS[plan].creditAllocation,
    trial_ends_at: null,
    updated_at: new Date().toISOString(),
  };

  if (plan === "trial") {
    /** Legacy label — store as Free (trial tier removed from product). */
    patch.plan = "free";
    patch.credits = PLAN_LIMITS.free.creditAllocation;
  }

  const { error } = await admin.from("profiles").update(patch).eq("id", userId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
