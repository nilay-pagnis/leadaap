"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  formatCreditsAllocationLabel,
  formatFormsLabel,
  formatFormsUsageLine,
  formatLeadsUsageLine,
  isFreeTier,
  isUnlimitedCredits,
  isUnlimitedForms,
  PLAN_LIMITS,
  PLAN_PRICING,
  planLabel,
  planTierRank,
  progressBarClassForBand,
} from "@/lib/monetization/plans";
import type { UsageSnapshot } from "@/lib/monetization/get-usage";
import { getPublicPaymentLink } from "@/lib/payments/payment-links";
import type { PaidPlan } from "@/lib/payments/plan-paid";
import { buttonVariants } from "@/components/ui/button-variants";
import { Check, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PaymentRow = {
  id: string;
  plan: string;
  amount_inr: number;
  payment_id: string;
  status: string;
  created_at: string;
};

type Props = {
  usage: UsageSnapshot;
  /** @deprecated kept for future prefill */
  userEmail?: string;
  hasPendingPayment: boolean;
  payments: PaymentRow[];
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
      `${formatFormsLabel(PLAN_LIMITS.starter.maxForms)} enquiry forms`,
      `${formatCreditsAllocationLabel(PLAN_LIMITS.starter.creditAllocation)} enquiry credits / month`,
    ],
  },
  {
    id: "growth",
    title: PLAN_PRICING.growth.label,
    priceInr: PLAN_PRICING.growth.priceInr,
    popular: true,
    highlights: [
      `${formatFormsLabel(PLAN_LIMITS.growth.maxForms)} enquiry forms`,
      `${formatCreditsAllocationLabel(PLAN_LIMITS.growth.creditAllocation)} enquiry credits / month`,
      "Best for growing teams",
    ],
  },
  {
    id: "premium",
    title: PLAN_PRICING.premium.label,
    priceInr: PLAN_PRICING.premium.priceInr,
    highlights: [
      `${formatFormsLabel(PLAN_LIMITS.premium.maxForms)} enquiry forms`,
      `${formatCreditsAllocationLabel(PLAN_LIMITS.premium.creditAllocation)} enquiry credits / month`,
    ],
  },
];

export function BillingClient({
  usage,
  hasPendingPayment,
  payments,
}: Props) {
  const pending = false;

  function upgradeViaPaymentLink(plan: PaidPlan) {
    const url = getPublicPaymentLink(plan);
    if (!url) {
      toast.error("Payment link not configured.");
      return;
    }
    try {
      localStorage.setItem("enquireo:selectedPlan", plan);
    } catch {
      // ignore
    }
    window.location.href = url;
  }

  const onFreeTier = isFreeTier(usage.plan);
  const userRank = planTierRank(usage.plan);

  const leadPct = usage.leadUsagePct;
  const formPct = usage.formUsagePct;

  const warn =
    usage.nearLeadLimit ||
    usage.nearFormLimit ||
    (!usage.leadCreditsUnlimited && usage.creditsRemaining <= 2);
  const critical = usage.atLeadLimit || usage.atFormLimit;

  return (
    <div className="mx-auto max-w-5xl space-y-6 lg:space-y-8">
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
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Transparent limits, no surprises. Pay through our Razorpay link, then paste your
          Payment ID on the confirm page. An admin verifies each payment before your plan and
          credits update — there is no automatic subscription webhook yet.
        </p>
        <p className="max-w-xl text-xs leading-relaxed text-muted-foreground/90">
          To change or downgrade a paid plan, contact support; self-serve cancellation is not
          available in-app today.
        </p>
      </div>

      {onFreeTier && (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            Current plan: Free
          </span>
          <span className="text-slate-600 dark:text-slate-400">
            {" "}
            — {PLAN_LIMITS.free.maxForms} enquiry form,{" "}
            {PLAN_LIMITS.free.creditAllocation} enquiry credits to get started.
          </span>
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/75 shadow-premium backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/45">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Current plan
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-sm font-medium",
                  onFreeTier && "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
                  usage.plan === "starter" && "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
                  usage.plan === "growth" && "bg-violet-100 text-violet-900 dark:bg-violet-950/40 dark:text-violet-200",
                  usage.plan === "premium" && "bg-indigo-100 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200"
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
                      "h-full rounded-full transition-all duration-500",
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
              {!isUnlimitedCredits(usage.leadCap) && (
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      progressBarClassForBand(usage.leadBand)
                    )}
                    style={{ width: `${leadPct}%` }}
                  />
                </div>
              )}
            </div>
            <p className="text-sm text-slate-500">
              {usage.leadCreditsUnlimited ? (
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  Unlimited enquiry credits this month
                </span>
              ) : (
                <>
                  <span className="font-medium tabular-nums text-gray-800 dark:text-gray-200">
                    {usage.creditsRemaining.toLocaleString("en-IN")}
                  </span>{" "}
                  credits remaining this month
                </>
              )}
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

        <Card className="border-slate-200/70 bg-white/75 shadow-premium backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/45">
          <CardHeader>
            <CardTitle className="text-xl font-semibold dark:text-slate-50">Quick actions</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Jump to checkout for any tier — you’ll confirm with your Payment ID after paying.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {SELECTABLE_PAID.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={pending || usage.plan === p.id}
                onClick={() => upgradeViaPaymentLink(p.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white/50 px-3 py-3 text-left transition-all duration-200",
                  "hover:border-primary/30 hover:bg-primary/[0.04] hover:shadow-md",
                  "disabled:pointer-events-none disabled:opacity-60 dark:border-white/10 dark:bg-zinc-900/40 dark:hover:border-primary/35"
                )}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {usage.plan === p.id ? `Current — ${p.title}` : p.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                    ₹{p.priceInr.toLocaleString("en-IN")}/mo · Razorpay link
                  </span>
                </span>
                <ExternalLink className="size-4 shrink-0 text-slate-400" aria-hidden />
              </button>
            ))}
            <Link
              href="/dashboard/billing/confirm"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "justify-start rounded-xl"
              )}
            >
              Submit Payment ID only (already paid)
            </Link>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
          Compare paid plans
        </h2>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          Starter, Growth, and Premium — pick capacity that matches your inbox volume. Free stays
          your default until you upgrade.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {SELECTABLE_PAID.map((p) => {
            const cardRank = planTierRank(p.id);
            const isCurrent = usage.plan === p.id;
            const showUpgrade = userRank < cardRank;

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
                  ) : (
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Manage from Quick checkout
                    </span>
                  )
                }
              />
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/75 shadow-premium backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/45">
        <div className="border-b border-slate-100/80 px-6 py-4 dark:border-white/10">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">Billing history</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Payment link submissions tied to your account.
          </p>
        </div>
        {payments.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
            <p className="max-w-sm text-sm text-slate-600 dark:text-slate-400">
              No payment records yet. After you pay through Razorpay, confirm your Payment ID — entries
              show up here with status (pending, approved, or rejected).
            </p>
            <Link
              href="/dashboard/billing/confirm"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "rounded-xl font-semibold"
              )}
            >
              Confirm a payment
            </Link>
          </div>
        ) : (
          <>
          <ul className="divide-y divide-slate-100 p-4 md:hidden dark:divide-white/10">
            {payments.map((p) => (
              <li key={p.id} className="flex flex-col gap-1 py-4 first:pt-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium capitalize text-slate-900 dark:text-slate-100">
                    {p.plan}
                  </span>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                      p.status === "approved" && "bg-emerald-50 text-emerald-800",
                      p.status === "pending" && "bg-amber-50 text-amber-900",
                      p.status === "rejected" && "bg-red-50 text-red-800"
                    )}
                  >
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {new Date(p.created_at).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <p className="tabular-nums text-sm text-slate-800 dark:text-slate-200">
                  ₹{p.amount_inr.toLocaleString("en-IN")}
                </p>
                <p className="truncate font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  {p.payment_id}
                </p>
              </li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 hover:bg-transparent">
                  <TableHead className="text-slate-500">Date</TableHead>
                  <TableHead className="text-slate-500">Plan</TableHead>
                  <TableHead className="text-right text-slate-500">Amount</TableHead>
                  <TableHead className="text-slate-500">Payment ID</TableHead>
                  <TableHead className="text-slate-500">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id} className="border-slate-100">
                    <TableCell className="whitespace-nowrap text-sm text-slate-700">
                      {new Date(p.created_at).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </TableCell>
                    <TableCell className="font-medium capitalize text-slate-900">{p.plan}</TableCell>
                    <TableCell className="text-right tabular-nums text-slate-800">
                      ₹{p.amount_inr.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate font-mono text-xs text-slate-600">
                      {p.payment_id}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                          p.status === "approved" && "bg-emerald-50 text-emerald-800",
                          p.status === "pending" && "bg-amber-50 text-amber-900",
                          p.status === "rejected" && "bg-red-50 text-red-800"
                        )}
                      >
                        {p.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          </>
        )}
      </div>

      <div className="space-y-2 text-center">
        <p className="text-xs font-medium tracking-wide text-slate-400">
          Powered by Enquireo
        </p>
        <p className="text-sm text-slate-500">
          <Link href="/dashboard" className="font-medium text-primary hover:underline">
            Back to dashboard
          </Link>
        </p>
      </div>
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
        "relative flex flex-col rounded-2xl border p-6 shadow-premium backdrop-blur-xl transition-all duration-300 hover:shadow-premium-hover dark:shadow-soft dark:hover:shadow-soft-lg",
        featured
          ? "border-primary/40 bg-gradient-to-b from-primary/[0.1] via-white/90 to-violet-50/50 ring-2 ring-primary/20 dark:from-primary/15 dark:via-zinc-950/60 dark:to-zinc-950/40 dark:ring-primary/35 md:scale-[1.02]"
          : "border-slate-200/75 bg-white/80 dark:border-white/10 dark:bg-zinc-950/50",
        current && "ring-2 ring-primary/45 dark:ring-primary/50"
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
