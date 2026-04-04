import type { PaidPlan } from "@/lib/payments/plan-paid";

/** Canonical Razorpay links (strict plan mapping). */
export function getPublicPaymentLink(plan: PaidPlan): string | null {
  const linkByPlan = {
    starter: "https://rzp.io/rzp/5KRVgKY",
    growth: "https://rzp.io/rzp/BAKM08x",
    premium: "https://rzp.io/rzp/Qmk7xycy",
  } as const;

  return linkByPlan[plan] ?? null;
}
