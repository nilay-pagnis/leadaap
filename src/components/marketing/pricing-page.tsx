"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, LineChart, TrendingUp, Zap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { MarketingShell } from "@/components/marketing/site/marketing-shell";
import {
  PLAN_LIMITS,
  PLAN_PRICING,
  formatCreditsAllocationLabel,
  formatFormsLabel,
} from "@/lib/monetization/plans";

const trialFormId = process.env.NEXT_PUBLIC_TRIAL_FORM_ID;
const pilotHref =
  trialFormId && trialFormId.length > 8
    ? `/f/${trialFormId}?source=pricing&plan=free`
    : "/signup";

const bookDemoHref =
  typeof process.env.NEXT_PUBLIC_BOOK_DEMO_URL === "string" &&
  process.env.NEXT_PUBLIC_BOOK_DEMO_URL.length > 0
    ? process.env.NEXT_PUBLIC_BOOK_DEMO_URL
    : "mailto:hello@enquireo.com?subject=Book%20a%20demo%20%E2%80%94%20Enquireo";

type PlanCard = {
  id: "starter" | "growth" | "premium";
  name: string;
  description: string;
  priceLabel: string;
  priceSub: string;
  features: string[];
  cta: { label: string; href: string; variant: "default" | "outline" };
  highlighted?: boolean;
};

const planCards: PlanCard[] = [
  {
    id: "starter",
    name: PLAN_PRICING.starter.label,
    description:
      "Perfect for solo founders and small teams validating inbound interest.",
    priceLabel: `₹${PLAN_PRICING.starter.priceInr.toLocaleString("en-IN")}`,
    priceSub: `per ${PLAN_PRICING.starter.period}, billed monthly`,
    features: [
      `${formatCreditsAllocationLabel(PLAN_LIMITS.starter.creditAllocation)} enquiry credits / month`,
      `${formatFormsLabel(PLAN_LIMITS.starter.maxForms)} enquiry capture forms`,
      "Embeddable widgets & share links",
      "Unified enquiry inbox",
      "Email notifications",
    ],
    cta: { label: "Start free pilot", href: pilotHref, variant: "outline" },
  },
  {
    id: "growth",
    name: PLAN_PRICING.growth.label,
    description:
      "The sweet spot for growing teams who need volume without complexity.",
    priceLabel: `₹${PLAN_PRICING.growth.priceInr.toLocaleString("en-IN")}`,
    priceSub: `per ${PLAN_PRICING.growth.period}, billed monthly`,
    features: [
      `${formatCreditsAllocationLabel(PLAN_LIMITS.growth.creditAllocation)} enquiry credits / month`,
      `${formatFormsLabel(PLAN_LIMITS.growth.maxForms)} enquiry capture forms`,
      "Everything in Starter",
      "Faster routing & status workflow",
      "Priority email support",
    ],
    cta: { label: "Start free pilot", href: pilotHref, variant: "default" },
    highlighted: true,
  },
  {
    id: "premium",
    name: PLAN_PRICING.premium.label,
    description:
      "Maximum throughput and unlimited enquiry forms for teams running serious campaigns.",
    priceLabel: `₹${PLAN_PRICING.premium.priceInr.toLocaleString("en-IN")}`,
    priceSub: `per ${PLAN_PRICING.premium.period}, billed monthly`,
    features: [
      `${formatCreditsAllocationLabel(PLAN_LIMITS.premium.creditAllocation)} enquiry credits / month`,
      `${formatFormsLabel(PLAN_LIMITS.premium.maxForms)} enquiry forms`,
      "Everything in Growth",
      "Higher limits for peak seasons",
      "Priority support",
    ],
    cta: { label: "Start free pilot", href: pilotHref, variant: "outline" },
  },
];

type CompareRow = { feature: string; values: [string, string, string] };

const comparisonRows: CompareRow[] = [
  {
    feature: "Enquiry credits / month",
    values: [
      formatCreditsAllocationLabel(PLAN_LIMITS.starter.creditAllocation),
      formatCreditsAllocationLabel(PLAN_LIMITS.growth.creditAllocation),
      formatCreditsAllocationLabel(PLAN_LIMITS.premium.creditAllocation),
    ],
  },
  {
    feature: "Active enquiry forms",
    values: [
      formatFormsLabel(PLAN_LIMITS.starter.maxForms),
      formatFormsLabel(PLAN_LIMITS.growth.maxForms),
      formatFormsLabel(PLAN_LIMITS.premium.maxForms),
    ],
  },
  {
    feature: "Enquiry inbox & pipeline",
    values: ["✓", "✓", "✓"],
  },
  {
    feature: "Embeds & public links",
    values: ["✓", "✓", "✓"],
  },
  {
    feature: "Team-ready workflow",
    values: ["—", "✓", "✓"],
  },
  {
    feature: "Priority support",
    values: ["—", "✓", "✓"],
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function PricingPage() {
  return (
    <MarketingShell>
      {/* Hero */}
      <section className="relative mx-auto max-w-4xl px-4 pb-16 pt-8 text-center sm:px-6 lg:pb-20 lg:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-white px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm ring-1 ring-emerald-500/10">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Free plan · No credit card
          </span>
          <h1 className="mt-8 text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.15rem] lg:leading-[1.12]">
            Simple pricing that scales with your pipeline
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600 sm:text-xl">
            Pay for outcomes, not noise. Every plan includes beautiful capture,
            a calm inbox, and room to grow — so you can turn attention into
            revenue faster.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href={pilotHref}
              className={cn(
                buttonVariants({ size: "lg" }),
                "group h-12 min-w-[200px] rounded-2xl px-8 text-base shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30"
              )}
            >
              Start free
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href={bookDemoHref}
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-12 min-w-[200px] rounded-2xl border-slate-200 bg-white px-8 text-base shadow-sm transition-all duration-200 hover:border-primary/30 hover:bg-slate-50"
              )}
            >
              Book a demo
            </a>
          </div>
        </motion.div>
      </section>

      {/* Pricing cards */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:pb-28">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
            className="grid gap-6 lg:grid-cols-3"
        >
          {planCards.map((plan) => (
            <motion.div
              key={plan.id}
              variants={fadeUp}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] transition-all duration-300",
                plan.highlighted
                  ? "z-[1] scale-[1.02] border-primary/40 shadow-[0_20px_50px_-16px_rgba(79,70,229,0.35)] ring-2 ring-primary/20 lg:-mt-2 lg:mb-2"
                  : "border-slate-200/90 hover:-translate-y-1 hover:border-slate-300/90 hover:shadow-[0_16px_40px_-16px_rgba(15,23,42,0.15)]"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="whitespace-nowrap rounded-full bg-gradient-to-r from-primary to-violet-600 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
                    Most popular
                  </span>
                </div>
              )}
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">{plan.name}</h2>
                <p className="mt-2 min-h-[3rem] text-sm leading-relaxed text-slate-600">
                  {plan.description}
                </p>
              </div>
              <div className="mb-6 border-b border-slate-100 pb-6">
                <p className="text-3xl font-semibold tracking-tight text-slate-900">
                  {plan.priceLabel}
                </p>
                <p className="mt-1 text-sm text-slate-500">{plan.priceSub}</p>
              </div>
              <ul className="mb-8 flex flex-1 flex-col gap-3 text-sm text-slate-700">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-emerald-600"
                      aria-hidden
                    />
                    <span className="leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
              {plan.cta.href.startsWith("/") ? (
                <Link
                  href={plan.cta.href}
                  className={cn(
                    buttonVariants({
                      variant: plan.cta.variant,
                      size: "lg",
                    }),
                    "w-full rounded-2xl transition-all duration-200",
                    plan.highlighted &&
                      "shadow-md shadow-indigo-500/20 hover:brightness-[1.03]"
                  )}
                >
                  {plan.cta.label}
                </Link>
              ) : (
                <a
                  href={plan.cta.href}
                  className={cn(
                    buttonVariants({
                      variant: plan.cta.variant,
                      size: "lg",
                    }),
                    "w-full rounded-2xl transition-all duration-200",
                    plan.highlighted &&
                      "shadow-md shadow-indigo-500/20 hover:brightness-[1.03]"
                  )}
                >
                  {plan.cta.label}
                </a>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Comparison */}
      <section className="relative z-10 border-y border-slate-200/80 bg-white/70 py-20 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Compare plans
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              Same product experience — pick the capacity that matches your funnel.
            </p>
          </div>

          <div className="mt-14 overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-[0_12px_40px_-20px_rgba(15,23,42,0.15)]">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90">
                  <th className="px-5 py-4 font-semibold text-slate-900">Feature</th>
                  <th className="px-5 py-4 font-semibold text-slate-900">Starter</th>
                  <th className="px-5 py-4 font-semibold text-primary">Growth</th>
                  <th className="px-5 py-4 font-semibold text-slate-900">Premium</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={cn(
                      "border-b border-slate-100 transition-colors hover:bg-slate-50/80",
                      i === comparisonRows.length - 1 && "border-b-0"
                    )}
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {row.feature}
                    </td>
                    {row.values.map((v, j) => (
                      <td
                        key={j}
                        className={cn(
                          "px-5 py-3.5 text-slate-600",
                          j === 1 && "bg-primary/[0.04] font-medium text-slate-800"
                        )}
                      >
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ROI */}
      <section className="relative z-10 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Why teams upgrade
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Enquiries are revenue waiting to happen
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              When capture is fast and follow-up is organized, more conversations
              turn into closed deals — without hiring another ops hire first.
            </p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="mt-14 grid gap-6 md:grid-cols-3"
          >
            {[
              {
                icon: Zap,
                title: "Capture without friction",
                stat: "↑ completion",
                body: "Branded enquiry forms that feel native convert more visitors into qualified opportunities — fewer drop-offs at the first touch.",
                accent: "from-amber-400/20 to-orange-500/10",
              },
              {
                icon: TrendingUp,
                title: "Speed to first reply",
                stat: "↑ win rate",
                body: "Enquiries routed instantly beat stale spreadsheets. Teams that respond in minutes win disproportionately more.",
                accent: "from-emerald-400/20 to-teal-500/10",
              },
              {
                icon: LineChart,
                title: "Forecastable pipeline",
                stat: "↑ predictable revenue",
                body: "One inbox means fewer leaks. Model pipeline from real volume instead of guessing from scattered tools.",
                accent: "from-indigo-400/20 to-violet-500/10",
              },
            ].map((block) => {
              const Icon = block.icon;
              return (
              <motion.div
                key={block.title}
                variants={fadeUp}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-8 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-16px_rgba(15,23,42,0.14)]"
                )}
              >
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                    block.accent
                  )}
                />
                <div className="relative">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
                    <Icon className="size-6" aria-hidden />
                  </div>
                  <p className="mt-4 text-xs font-bold uppercase tracking-wider text-primary">
                    {block.stat}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">
                    {block.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {block.body}
                  </p>
                </div>
              </motion.div>
            );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mx-auto mt-14 max-w-3xl rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/50 p-8 text-center shadow-inner sm:p-10"
          >
            <p className="text-sm font-medium text-slate-500">Illustrative math</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              <span className="text-primary">500</span> extra qualified enquiries / yr ×{" "}
              <span className="text-primary">₹8,000</span> avg deal ×{" "}
              <span className="text-primary">12%</span> close rate
            </p>
            <p className="mt-2 text-lg font-medium text-slate-700">
              ≈ <span className="tabular-nums text-primary">₹48L</span> in opportunity
              surfaced — before you scale ads.
            </p>
            <p className="mt-4 text-xs text-slate-500">
              Replace inputs with your own averages; the point is volume compounds when
              capture and follow-up stay tight.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 border-t border-slate-200/80 bg-gradient-to-b from-indigo-50/40 to-white py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Ready when you are
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Start free on your own timeline, then upgrade as your pipeline grows.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href={pilotHref}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 min-w-[200px] rounded-2xl px-8 text-base shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5"
              )}
            >
              Start free
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <a
              href={bookDemoHref}
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-12 min-w-[200px] rounded-2xl border-slate-200 bg-white px-8 text-base shadow-sm transition-all duration-200 hover:border-primary/30"
              )}
            >
              Book a demo
            </a>
          </div>
        </div>
      </section>

    </MarketingShell>
  );
}
