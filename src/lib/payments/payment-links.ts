import type { PaidPlan } from "@/lib/payments/plan-paid";

/** Canonical Razorpay links (strict plan mapping). */
export function getPublicPaymentLink(plan: PaidPlan): string | null {
  const linkByPlan = {
    starter: "https://rzp.io/rzp/aG2okJyY",
    growth: "https://rzp.io/rzp/C0wFGBoU",
    premium: "https://rzp.io/rzp/JCtIleq",
  } as const;

  return linkByPlan[plan] ?? null;
}
