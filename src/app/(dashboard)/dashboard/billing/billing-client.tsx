"use client";

import { useTransition } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  formatFormsLabel,
  formatFormsUsageLine,
  formatLeadsUsageLine,
  isFreeTier,
  isPaidPlan,
  isUnlimitedForms,
  PLAN_LIMITS,
  PLAN_PRICING,
  planLabel,
  planTierRank,
  progressBarClassForBand,
} from "@/lib/monetization/plans";
import type { UsageSnapshot } from "@/lib/monetization/get-usage";
import {
  downgradePaidPlanAction,
  downgradeToFreeAction,
} from "@/app/actions/billing";
import { getPublicPaymentLink } from "@/lib/payments/payment-links";
import type { PaidPlan } from "@/lib/payments/plan-paid";
import { buttonVariants } from "@/components/ui/button-variants";
import { Check, ExternalLink, Loader2 } from "lucide-react";

type Props = {
  usage: UsageSnapshot;
  /** @deprecated kept for future prefill */
  userEmail?: string;
  hasPendingPayment: boolean;
};

const SELECTABLE_PAID: {
  id: PaidPlan;
  title: string;
  priceInr: number;
  highlights: string[];
  popular?: boolean;
}[] = [
  {
    id: "starter",
    title: PLAN_PRICING.starter.label,
    priceInr: PLAN_PRICING.starter.priceInr,
    highlights: [
      `${formatFormsLabel(PLAN_LIMITS.starter.maxForms)} forms`,
      `${PLAN_LIMITS.starter.creditAllocation.toLocaleString("en-IN")} lead credits / month`,
    ],
  },
  {
    id: "growth",
    title: PLAN_PRICING.growth.label,
    priceInr: PLAN_PRICING.growth.priceInr,
    popular: true,
    highlights: [
      `${formatFormsLabel(PLAN_LIMITS.growth.maxForms)} forms`,
      `${PLAN_LIMITS.growth.creditAllocation.toLocaleString("en-IN")} lead credits / month`,
      "Best for growing teams",
    ],
  },
  {
    id: "premium",
    title: PLAN_PRICING.premium.label,
    priceInr: PLAN_PRICING.premium.priceInr,
    highlights: [
      `${formatFormsLabel(PLAN_LIMITS.premium.maxForms)} forms`,
      `${PLAN_LIMITS.premium.creditAllocation.toLocaleString("en-IN")} lead credits / month`,
    ],
  },
];

export function BillingClient({
  usage,
  hasPendingPayment,
}: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function run(
    label: string,
    fn: () => Promise<{ ok: boolean; error?: string }>
  ) {
    start(async () => {
      const r = await fn();
      if (r.ok) {
        toast.success(`${label} — you’re all set.`);
        router.refresh();
      } else {
        toast.error(r.error ?? "Something went wrong");
      }
    });
  }

  function upgradeViaPaymentLink(plan: PaidPlan) {
    const url = getPublicPaymentLink(plan);
    if (!url) {
      toast.error("Payment link not configured.");
      return;
    }
    try {
      localStorage.setItem("leadaap:selectedPlan", plan);
    } catch {
      // ignore
    }
    window.location.href = url;
  }

  const onFreeTier = isFreeTier(usage.plan);
  const paidUser = isPaidPlan(usage.plan);
  const userRank = planTierRank(usage.plan);

  const leadPct = usage.leadUsagePct;
  const formPct = usage.formUsagePct;

  const warn =
    usage.nearLeadLimit ||
    usage.nearFormLimit ||
    usage.creditsRemaining <= 2;
  const critical = usage.atLeadLimit || usage.atFormLimit;

  return (
    <div className="mx-auto max-w-5xl space-y-8 lg:space-y-10">
      {usage.usedFallback && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          We couldn’t sync your billing profile from the server — showing defaults.
          If this persists, check that the <code className="rounded bg-white/50 px-1">profiles</code> table
          exists in Supabase.
        </p>
      )}

      {hasPendingPayment && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <strong>Pending verification:</strong> we’ve received your Payment ID and
          will upgrade your workspace after manual approval (usually within one
          business day).
        </p>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Billing</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Plans &amp; usage
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
          Pay with a Razorpay payment link, then submit your Payment ID for approval.
          Free is your always-on tier — upgrade when you need more capacity.
        </p>
      </div>

      {onFreeTier && (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            Current plan: Free
          </span>
          <span className="text-slate-600 dark:text-slate-400">
            {" "}
            — {PLAN_LIMITS.free.maxForms} form,{" "}
            {PLAN_LIMITS.free.creditAllocation} lead credits to get started.
          </span>
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">
              Current plan
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-sm font-medium",
                  onFreeTier && "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
                  usage.plan === "starter" && "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
                  usage.plan === "growth" && "bg-violet-100 text-violet-900 dark:bg-violet-950/40 dark:text-violet-200",
                  usage.plan === "premium" && "bg-indigo-100 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200",
                  usage.plan === "enterprise" &&
                    "bg-amber-100 text-amber-950 dark:bg-amber-950/40 dark:text-amber-200"
                )}
              >
                {planLabel(usage.plan)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-700">
                {formatFormsUsageLine(usage.formCount, usage.maxForms)}
              </p>
              {!isUnlimitedForms(usage.maxForms) && (
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      progressBarClassForBand(usage.formBand)
                    )}
                    style={{ width: `${formPct}%` }}
                  />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">
                {formatLeadsUsageLine(usage.leadsUsed, usage.leadCap)}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    progressBarClassForBand(usage.leadBand)
                  )}
                  style={{ width: `${leadPct}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-slate-500">
              <span className="font-medium tabular-nums text-gray-800 dark:text-gray-200">
                {usage.creditsRemaining}
              </span>{" "}
              credits remaining
            </p>
            {critical && (
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                You’re at a plan limit — upgrade to continue growing.
              </p>
            )}
            {!critical && warn && (
              <p
                className={cn(
                  "text-sm dark:text-amber-200/90",
                  usage.worstBand === "strong" && "text-orange-800 dark:text-orange-200/90",
                  usage.worstBand === "soft" && "text-amber-800",
                  usage.worstBand === "ok" && "text-amber-800 dark:text-amber-200/90"
                )}
              >
                {usage.worstBand === "strong"
                  ? "You’re in the top 10% of your allocation — upgrade before you hit the cap."
                  : usage.worstBand === "soft"
                    ? "You’ve crossed 70% of a limit — upgrade anytime for more headroom."
                    : "Only a few credits left this cycle — consider upgrading soon."}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Quick actions</CardTitle>
            <p className="text-sm text-slate-500">
              Open a payment link for the tier you want, then confirm your Payment ID.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {SELECTABLE_PAID.map((p) => (
              <Button
                key={p.id}
                variant="outline"
                disabled={pending || usage.plan === p.id}
                onClick={() => upgradeViaPaymentLink(p.id)}
              >
                <ExternalLink className="mr-2 size-4 shrink-0" />
                {usage.plan === p.id
                  ? `Current — ${p.title}`
                  : `Pay — ${p.title} (₹${p.priceInr}/mo)`}
              </Button>
            ))}
            <Link
              href="/dashboard/billing/confirm"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "justify-start"
              )}
            >
              Submit Payment ID only (already paid)
            </Link>
            {paidUser && (
              <Button
                variant="ghost"
                disabled={pending}
                onClick={() => run("Switched to Free", () => downgradeToFreeAction())}
              >
                Downgrade to Free
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Compare paid plans
        </h2>
        <p className="mb-6 text-sm text-slate-600">
          Only Starter, Growth, and Premium are available to buy. Free stays your
          default until you upgrade.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {SELECTABLE_PAID.map((p) => {
            const cardRank = planTierRank(p.id);
            const isCurrent = usage.plan === p.id;
            const showUpgrade = userRank < cardRank;
            const showDowngrade = paidUser && userRank > cardRank;

            return (
              <PlanCard
                key={p.id}
                title={p.title}
                priceInr={p.priceInr}
                highlights={p.highlights}
                current={isCurrent}
                featured={p.popular === true}
                badge={p.popular ? "Most popular" : undefined}
                cta={
                  isCurrent ? (
                    <span className="text-sm font-medium text-primary">
                      Current plan
                    </span>
                  ) : showUpgrade ? (
                    <Button
                      className="w-full"
                      disabled={pending}
                      onClick={() => upgradeViaPaymentLink(p.id)}
                    >
                      <ExternalLink className="mr-2 size-4 shrink-0" />
                      Upgrade — ₹{p.priceInr}/mo
                    </Button>
                  ) : showDowngrade ? (
                    <Button
                      className="w-full"
                      variant="secondary"
                      disabled={pending}
                      onClick={() =>
                        run(`Plan → ${p.title}`, () =>
                          downgradePaidPlanAction(p.id)
                        )
                      }
                    >
                      {pending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        `Switch to ${p.title}`
                      )}
                    </Button>
                  ) : (
                    <span className="text-sm text-slate-500">
                      Manage from Quick actions
                    </span>
                  )
                }
              />
            );
          })}
        </div>
      </div>

      <p className="text-center text-sm text-slate-500">
        <Link href="/dashboard" className="font-medium text-primary hover:underline">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}

function PlanCard({
  title,
  priceInr,
  highlights,
  current,
  badge,
  featured,
  cta,
}: {
  title: string;
  priceInr: number;
  highlights: string[];
  current: boolean;
  badge?: string;
  featured?: boolean;
  cta: React.ReactNode;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative flex flex-col rounded-2xl border p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)] transition-all duration-300",
        featured
          ? "border-primary/35 bg-gradient-to-b from-primary/[0.07] to-white ring-2 ring-primary/25 md:scale-[1.02]"
          : "border-slate-200 bg-white",
        current && "ring-2 ring-primary/40"
      )}
    >
      {(badge || featured) && (
        <div className="absolute right-4 top-4">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-semibold",
              featured
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-slate-100 text-slate-700 ring-1 ring-slate-200/80"
            )}
          >
            {badge ?? "Most popular"}
          </span>
        </div>
      )}
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <h2 className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
        ₹{priceInr.toLocaleString("en-IN")}
        <span className="text-sm font-normal text-slate-500">/mo</span>
      </h2>
      <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600">
        {highlights.map((h) => (
          <li key={h} className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            {h}
          </li>
        ))}
      </ul>
      <div className="mt-6">{cta}</div>
    </motion.div>
  );
}
