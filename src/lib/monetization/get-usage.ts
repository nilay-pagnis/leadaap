import { createClient } from "@/lib/supabase/server";
import {
  formUsageCritical,
  isUnlimitedCredits,
  isUnlimitedForms,
  leadCapForPlan,
  mergeUsageBands,
  normalizePlanId,
  PLAN_LIMITS,
  usageBand,
  type UsageBand,
  usageCriticalRatio,
  usagePercent,
  usageWarningRatio,
} from "@/lib/monetization/plans";
import { ensureProfile, resolveAndSyncProfile } from "@/lib/monetization/profile";
import type { PlanId } from "@/types/billing";

export type UsageSnapshot = {
  plan: PlanId;
  creditsRemaining: number;
  /** True when plan has unlimited monthly enquiry credits (Premium). */
  leadCreditsUnlimited: boolean;
  leadCap: number;
  /** Calendar-month (UTC) enquiries on this user’s forms — same scope as public submit & manual add limits. */
  leadsUsed: number;
  formCount: number;
  maxForms: number;
  /** 0–100 of lead allocation used */
  leadUsagePct: number;
  /** 0–100 of form slots used (0 if unlimited) */
  formUsagePct: number;
  leadBand: UsageBand;
  formBand: UsageBand;
  /** Highest urgency across leads + forms */
  worstBand: UsageBand;
  nearLeadLimit: boolean;
  nearFormLimit: boolean;
  /** At or over lead cap */
  atLeadLimit: boolean;
  /** At or over form slots */
  atFormLimit: boolean;
  /** Profile row missing or fetch failed — UI still works with defaults */
  usedFallback: boolean;
};

async function countFormsForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("forms")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) return 0;
  return count ?? 0;
}

/**
 * Count leads for this workspace owner (`user_id`), including standalone manual rows
 * (`form_id` null). Matches public submit + manual API enforcement.
 */
async function countLeadsForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  options: { sinceStartOfMonthUtc?: boolean } = {}
): Promise<number> {
  let q = supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (options.sinceStartOfMonthUtc) {
    const now = new Date();
    const since = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)
    ).toISOString();
    q = q.gte("created_at", since);
  }

  const { count, error } = await q;
  if (error) return 0;
  return count ?? 0;
}

/**
 * Always returns a usable snapshot (never null). Uses Free defaults if profile
 * cannot be loaded so the UI never crashes.
 */
export async function getUsageForUser(userId: string): Promise<UsageSnapshot> {
  const supabase = await createClient();
  await ensureProfile(supabase, userId);

  const { data: raw, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  let usedFallback = false;
  let plan: PlanId = "free";
  let credits = PLAN_LIMITS.free.creditAllocation;

  if (error || !raw) {
    usedFallback = true;
  } else {
    plan = normalizePlanId(raw.plan);
    const c = raw.credits;
    credits =
      typeof c === "number" && Number.isFinite(c) && c >= 0
        ? Math.floor(c)
        : PLAN_LIMITS[plan].creditAllocation;
  }

  const effective = await resolveAndSyncProfile(userId, {
    plan,
    credits,
  });

  const leadCap = leadCapForPlan(effective.plan);
  const maxForms = PLAN_LIMITS[effective.plan].maxForms;

  const [fc, leadsUsed] = await Promise.all([
    countFormsForUser(supabase, userId),
    countLeadsForUser(supabase, userId, { sinceStartOfMonthUtc: true }),
  ]);

  const leadCreditsUnlimited = isUnlimitedCredits(leadCap);

  const leadBand = usageBand(leadsUsed, leadCap);
  const formBand = isUnlimitedForms(maxForms)
    ? ("na" as UsageBand)
    : usageBand(fc, maxForms);
  const worstBand = mergeUsageBands(leadBand, formBand);

  const leadUsagePct = usagePercent(leadsUsed, leadCap);
  const formUsagePct =
    !isUnlimitedForms(maxForms) && maxForms > 0
      ? usagePercent(fc, maxForms)
      : 0;

  const nearLeadLimit = usageWarningRatio(leadsUsed, leadCap);
  const nearFormLimit =
    !isUnlimitedForms(maxForms) && maxForms > 0 && fc / maxForms >= 0.7;
  const atLeadLimit = usageCriticalRatio(leadsUsed, leadCap);
  const atFormLimit = formUsageCritical(fc, maxForms);

  const creditsRemaining = leadCreditsUnlimited
    ? 0
    : Math.max(0, leadCap - leadsUsed);

  return {
    plan: effective.plan,
    creditsRemaining,
    leadCreditsUnlimited,
    leadCap,
    leadsUsed,
    formCount: fc,
    maxForms,
    leadUsagePct,
    formUsagePct,
    leadBand,
    formBand,
    worstBand,
    nearLeadLimit,
    nearFormLimit,
    atLeadLimit,
    atFormLimit,
    usedFallback,
  };
}
