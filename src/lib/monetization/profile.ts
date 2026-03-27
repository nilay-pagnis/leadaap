import { createAdminClient } from "@/lib/supabase/admin";
import type { PlanId } from "@/types/billing";
import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizePlanId, PLAN_LIMITS } from "./plans";

export type EffectiveProfile = {
  id: string;
  plan: PlanId;
  credits: number;
  trial_ends_at: string | null;
  trialExpired: boolean;
};

/**
 * Migrates legacy `trial` rows to Free and returns effective plan/limits.
 */
export async function resolveAndSyncProfile(
  userId: string,
  row: {
    plan: unknown;
    credits: unknown;
    trial_ends_at: string | null;
  }
): Promise<EffectiveProfile> {
  let plan = normalizePlanId(row.plan);
  let credits =
    typeof row.credits === "number" && Number.isFinite(row.credits) && row.credits >= 0
      ? Math.floor(row.credits)
      : PLAN_LIMITS[plan].creditAllocation;
  let trial_ends_at = row.trial_ends_at;
  let trialExpired = false;

  /** Legacy `trial` plan removed — migrate to Free (same limits). */
  if (plan === "trial") {
    trialExpired = true;
    plan = "free";
    credits = Math.min(credits, PLAN_LIMITS.free.creditAllocation);
    trial_ends_at = null;
    try {
      const admin = createAdminClient();
      await admin
        .from("profiles")
        .update({
          plan: "free",
          credits,
          trial_ends_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    } catch {
      // still return effective values for this request
    }
  }

  return {
    id: userId,
    plan,
    credits,
    trial_ends_at,
    trialExpired,
  };
}

export async function fetchProfileRow(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) return { data: null, error };
  return { data, error: null };
}

/** Ensure a profile row exists (e.g. legacy users before trigger). */
export async function ensureProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<{ plan: PlanId; credits: number; trial_ends_at: string | null } | null> {
  let { data } = await supabase
    .from("profiles")
    .select("plan, credits, trial_ends_at")
    .eq("id", userId)
    .maybeSingle();

  if (!data) {
    const { data: inserted, error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        plan: "free",
        credits: PLAN_LIMITS.free.creditAllocation,
        trial_ends_at: null,
      })
      .select("plan, credits, trial_ends_at")
      .single();
    if (error) return null;
    data = inserted;
  }

  return data as {
    plan: PlanId;
    credits: number;
    trial_ends_at: string | null;
  };
}
