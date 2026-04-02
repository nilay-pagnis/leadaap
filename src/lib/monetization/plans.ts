import type { PlanId } from "@/types/billing";

/** Growth tier: treat as unlimited forms for limits & UI */
export const UNLIMITED_FORMS_SENTINEL = 1_000_000;

/** Display / allocation — Indian market (INR) */
export const PLAN_PRICING = {
  starter: { label: "Starter", priceInr: 499, period: "month" },
  growth: { label: "Growth", priceInr: 1499, period: "month" },
  premium: { label: "Premium", priceInr: 3499, period: "month" },
} as const;

export type PaidPlanKey = keyof typeof PLAN_PRICING;

export const PLAN_CREDITS = {
  free: 10,
  starter: 300,
  growth: 2000,
  premium: 5000,
} as const;

export const PLAN_LIMITS: Record<
  PlanId,
  { maxForms: number; creditAllocation: number }
> = {
  free: { maxForms: 1, creditAllocation: PLAN_CREDITS.free },
  starter: { maxForms: 5, creditAllocation: PLAN_CREDITS.starter },
  growth: {
    maxForms: UNLIMITED_FORMS_SENTINEL,
    creditAllocation: PLAN_CREDITS.growth,
  },
  premium: { maxForms: UNLIMITED_FORMS_SENTINEL, creditAllocation: PLAN_CREDITS.premium },
};

export function normalizePlanId(raw: unknown): PlanId {
  const p = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (p === "free" || p === "starter" || p === "growth" || p === "premium") {
    return p;
  }
  return "free";
}

export function isUnlimitedForms(maxForms: number): boolean {
  return maxForms >= UNLIMITED_FORMS_SENTINEL;
}

/** True when user cannot create another form */
export function isAtFormLimit(formCount: number, maxForms: number): boolean {
  if (isUnlimitedForms(maxForms)) return false;
  return formCount >= maxForms;
}

export function formatFormsLabel(maxForms: number): string {
  if (isUnlimitedForms(maxForms)) return "Unlimited";
  return String(maxForms);
}

export function formatFormsUsageLine(formCount: number, maxForms: number): string {
  if (isUnlimitedForms(maxForms)) {
    return `${formCount} enquiry form${formCount === 1 ? "" : "s"} used (unlimited)`;
  }
  return `${formCount} / ${maxForms} enquiry forms used`;
}

export function formatLeadsUsageLine(leadsUsed: number, leadCap: number): string {
  return `${leadsUsed} / ${leadCap} enquiries used`;
}

export function isFreeTier(plan: PlanId): boolean {
  return plan === "free";
}

/** Relative order for upgrade/downgrade (higher = more capable). */
export function planTierRank(plan: PlanId): number {
  switch (normalizePlanId(plan)) {
    case "free":
      return 0;
    case "starter":
      return 1;
    case "growth":
      return 2;
    case "premium":
      return 3;
    default:
      return 0;
  }
}

export function planLabel(plan: PlanId): string {
  switch (plan) {
    case "free":
      return "Free";
    case "starter":
      return "Starter";
    case "growth":
      return "Growth";
    case "premium":
      return "Premium";
    default:
      return plan;
  }
}

/** Credits cap for “leads” display (allocation for current plan) */
export function leadCapForPlan(plan: PlanId): number {
  return PLAN_LIMITS[plan].creditAllocation;
}

/** Usage bands: 70% soft, 90% strong, 100% at limit. `na` = no cap / unlimited. */
export type UsageBand = "ok" | "soft" | "strong" | "limit" | "na";

export const USAGE_SOFT_PCT = 70;
export const USAGE_STRONG_PCT = 90;

export function usagePercent(used: number, cap: number): number {
  if (cap <= 0) return 0;
  return Math.min(100, Math.round((used / cap) * 100));
}

export function usageBand(used: number, cap: number): UsageBand {
  if (cap <= 0) return "na";
  const r = used / cap;
  if (r >= 1) return "limit";
  if (r >= 0.9) return "strong";
  if (r >= 0.7) return "soft";
  return "ok";
}

function bandRank(b: UsageBand): number {
  switch (b) {
    case "ok":
      return 0;
    case "soft":
      return 1;
    case "strong":
      return 2;
    case "limit":
      return 3;
    case "na":
      return 0;
    default:
      return 0;
  }
}

/** Worst urgency across leads + forms (unlimited forms → `na` ignored for that axis). */
export function mergeUsageBands(lead: UsageBand, form: UsageBand): UsageBand {
  const a = lead === "na" ? ("ok" as UsageBand) : lead;
  const b = form === "na" ? ("ok" as UsageBand) : form;
  return bandRank(a) >= bandRank(b) ? a : b;
}

/** Tailwind background for usage progress bars (light theme). */
export function progressBarClassForBand(band: UsageBand): string {
  switch (band) {
    case "ok":
      return "bg-primary";
    case "soft":
      return "bg-amber-500";
    case "strong":
      return "bg-orange-500";
    case "limit":
      return "bg-red-500";
    case "na":
    default:
      return "bg-slate-400";
  }
}

/** @deprecated prefer usageBand — kept for callers using 80% threshold */
export function usageWarningRatio(used: number, cap: number): boolean {
  if (cap <= 0) return false;
  return used / cap >= 0.7;
}

/** Critical when at or over cap (should upgrade) */
export function usageCriticalRatio(used: number, cap: number): boolean {
  if (cap <= 0) return false;
  return used / cap >= 1;
}

export function formUsageCritical(formCount: number, maxForms: number): boolean {
  if (isUnlimitedForms(maxForms)) return false;
  if (maxForms <= 0) return false;
  return formCount / maxForms >= 1;
}

export function formUsageWarning(formCount: number, maxForms: number): boolean {
  if (isUnlimitedForms(maxForms)) return false;
  if (maxForms <= 0) return false;
  return formCount / maxForms >= 0.7;
}

/** Plans that count as paid / active subscription */
export const PAID_PLAN_IDS: PlanId[] = [
  "starter",
  "growth",
  "premium",
];

export function isPaidPlan(plan: PlanId): boolean {
  return PAID_PLAN_IDS.includes(plan);
}
