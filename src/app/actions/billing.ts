"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  isPaidPlan,
  PLAN_LIMITS,
  planTierRank,
  normalizePlanId,
} from "@/lib/monetization/plans";
import type { PlanId } from "@/types/billing";

export type BillingActionResult =
  | { ok: true }
  | { ok: false; error: string };

/** @deprecated Trial tier removed — Free plan is the entry experience. */
export async function startTrialAction(): Promise<BillingActionResult> {
  return {
    ok: false,
    error:
      "The separate trial tier is retired. Your Free plan includes a generous way to try LeadAap — upgrade anytime from Billing.",
  };
}

export async function upgradePlanAction(
  plan: Extract<PlanId, "starter" | "growth" | "premium">
): Promise<BillingActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const allocation = PLAN_LIMITS[plan].creditAllocation;

  const { error } = await supabase
    .from("profiles")
    .update({
      plan,
      credits: allocation,
      trial_ends_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

/** Move from a higher paid tier to Starter, Growth, or Premium (no refund logic). */
export async function downgradePaidPlanAction(
  target: Extract<PlanId, "starter" | "growth" | "premium">
): Promise<BillingActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { data: row, error: fetchErr } = await supabase
    .from("profiles")
    .select("plan, credits")
    .eq("id", user.id)
    .maybeSingle();

  if (fetchErr || !row) {
    return { ok: false, error: "Could not load your billing profile." };
  }

  const current = normalizePlanId(row.plan);
  if (!isPaidPlan(current)) {
    return {
      ok: false,
      error: "Paid tier changes apply when you’re already on a paid plan.",
    };
  }

  const cr = planTierRank(current);
  const tr = planTierRank(target);
  if (cr <= tr) {
    return {
      ok: false,
      error: "Choose a lower tier than your current plan.",
    };
  }

  const prevCredits =
    typeof row.credits === "number" && Number.isFinite(row.credits)
      ? Math.floor(row.credits)
      : PLAN_LIMITS[target].creditAllocation;
  const nextCredits = Math.min(prevCredits, PLAN_LIMITS[target].creditAllocation);

  const { error } = await supabase
    .from("profiles")
    .update({
      plan: target,
      credits: nextCredits,
      trial_ends_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function downgradeToFreeAction(): Promise<BillingActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { data: row } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single();

  const nextCredits = Math.min(
    PLAN_LIMITS.free.creditAllocation,
    row?.credits ?? PLAN_LIMITS.free.creditAllocation
  );

  const { error } = await supabase
    .from("profiles")
    .update({
      plan: "free",
      credits: nextCredits,
      trial_ends_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}
