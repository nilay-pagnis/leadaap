"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PLAN_LIMITS } from "@/lib/monetization/plans";
import type { PlanId } from "@/types/billing";

export type BillingActionResult =
  | { ok: true }
  | { ok: false; error: string };

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
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}
