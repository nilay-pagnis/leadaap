import type { PlanId } from "@/types/billing";
import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizePlanId, PLAN_LIMITS } from "./plans";

export type EffectiveProfile = {
  id: string;
  plan: PlanId;
  credits: number;
};

export async function resolveAndSyncProfile(
  _userId: string,
  row: {
    plan: unknown;
    credits: unknown;
  }
): Promise<EffectiveProfile> {
  const plan = normalizePlanId(row.plan);
  const credits =
    typeof row.credits === "number" && Number.isFinite(row.credits) && row.credits >= 0
      ? Math.floor(row.credits)
      : PLAN_LIMITS[plan].creditAllocation;

  return {
    id: _userId,
    plan,
    credits,
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
): Promise<{ plan: PlanId; credits: number } | null> {
  let { data } = await supabase
    .from("profiles")
    .select("plan, credits")
    .eq("id", userId)
    .maybeSingle();

  if (!data) {
    const { data: inserted, error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        plan: "free",
        credits: PLAN_LIMITS.free.creditAllocation,
      })
      .select("plan, credits")
      .single();
    if (error) return null;
    data = inserted;
  }

  return data as {
    plan: PlanId;
    credits: number;
  };
}
