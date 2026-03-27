"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Inbox,
  LineChart,
  Lock,
  MousePointerClick,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LightCanvas } from "@/components/layout/light-canvas";
import {
  PLAN_LIMITS,
  PLAN_PRICING,
  formatFormsLabel,
} from "@/lib/monetization/plans";

const logos = ["Acme", "Northwind", "Lumen", "Orbital", "Studio 42"];

const trialFormId = process.env.NEXT_PUBLIC_TRIAL_FORM_ID;
const pilotHref =
  trialFormId && trialFormId.length > 8
    ? `/f/${trialFormId}?source=home&plan=trial`
    : "/signup";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F8FAFC] text-slate-900">
      <LightCanvas />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20">
            <Sparkles className="size-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">LeadAap</span>
        </Link>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <Link
            href="/pricing"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "rounded-full px-3 text-sm font-medium text-slate-600 hover:text-slate-900 sm:px-4"
            )}
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "rounded-full px-3 text-sm font-medium text-slate-600 hover:text-slate-900 sm:px-4"
            )}
          >
            Log in
          </Link>
          <Link
            href={pilotHref}
            className={cn(
              buttonVariants(),
              "rounded-full px-4 shadow-md shadow-indigo-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:px-6"
            )}
          >
            Start pilot
          </Link>
        </div>
      </header>

      {/* 1. Hero */}
      <section
        id="top"
        className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-4 text-center lg:pb-24 lg:pt-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl"
        >
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Built for teams who sell — not babysit tools
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]">
            Turn visitors into paying clients
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600 sm:text-xl">
            LeadAap replaces scattered forms and messy inboxes with one calm
            workspace — so every click has a path to revenue, not a dead end.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href={pilotHref}
              className={cn(
                buttonVariants({ size: "lg" }),
                "group h-12 min-w-[200px] rounded-2xl px-8 text-base shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/35"
              )}
            >
              Start free pilot
              <ArrowRight className="ml-2 size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/pricing"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-12 min-w-[200px] rounded-2xl border-slate-200/90 bg-white px-8 text-base shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-slate-50"
              )}
            >
              View pricing
              <ArrowUpRight className="ml-1.5 size-4 opacity-70" />
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2">
              <Check className="size-4 text-emerald-600" />
              No credit card to start
            </span>
            <span className="inline-flex items-center gap-2">
              <Lock className="size-4 text-primary" />
              Data stays yours
            </span>
            <span className="inline-flex items-center gap-2">
              <Zap className="size-4 text-violet-600" />
              5-day pilot
            </span>
          </div>
        </motion.div>
      </section>

      {/* Trust strip */}
      <section className="relative z-10 border-y border-slate-200/70 bg-white/50 py-10 backdrop-blur-sm">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Trusted by teams who ship
        </p>
        <div className="mx-auto mt-6 flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-6">
          {logos.map((name) => (
            <span
              key={name}
              className="text-base font-semibold tracking-tight text-slate-400 transition-colors hover:text-slate-500"
            >
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* 2. Problem → Solution */}
      <section className="relative z-10 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="grid gap-6 lg:grid-cols-2 lg:gap-10"
          >
            <motion.div variants={fadeUp}>
              <p className="text-xs font-semibold uppercase tracking-widest text-rose-600/90">
                The problem
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Traffic arrives — then quietly disappears
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                Generic forms, buried inboxes, and five tabs to figure out who
                to call next. Teams lose momentum before a human ever says hello.
              </p>
              <ul className="mt-8 space-y-3 text-slate-700">
                {[
                  "Leads sit in email threads nobody owns",
                  "No single view of what’s new vs. nurtured",
                  "Follow-up depends on memory, not motion",
                ].map((line) => (
                  <li key={line} className="flex gap-3 text-sm sm:text-base">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-rose-400" />
                    {line}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div variants={fadeUp}>
              <div className="h-full rounded-2xl border border-primary/15 bg-gradient-to-br from-white via-indigo-50/40 to-violet-50/30 p-8 shadow-[0_20px_50px_-24px_rgba(79,70,229,0.25)] ring-1 ring-primary/10 lg:p-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  The LeadAap way
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  One flow from capture to close
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-slate-600">
                  Publish on-brand capture in minutes, route every submission to
                  one pipeline, and move deals forward without switching
                  context.
                </p>
                <ul className="mt-8 space-y-3">
                  {[
                    "Branded forms that feel native to your site",
                    "A single inbox your whole team can trust",
                    "Clear next steps — so revenue isn’t left on read",
                  ].map((line) => (
                    <li key={line} className="flex gap-3 text-sm text-slate-800 sm:text-base">
                      <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3. How it works */}
      <section className="relative z-10 border-y border-slate-200/70 bg-white/60 py-20 backdrop-blur-sm lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Three steps. Zero busywork.
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              From first visit to qualified conversation — without a project plan.
            </p>
          </div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="mt-14 grid gap-6 md:grid-cols-3"
          >
            {[
              {
                step: "01",
                title: "Capture",
                desc: "Drop in a form that matches your brand — live in minutes, not sprints.",
                icon: MousePointerClick,
              },
              {
                step: "02",
                title: "Qualify",
                desc: "Every submission lands in one pipeline so ownership is obvious.",
                icon: Inbox,
              },
              {
                step: "03",
                title: "Convert",
                desc: "Move faster from first touch to booked calls and closed revenue.",
                icon: TrendingUp,
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.step} variants={item}>
                  <Card className="h-full rounded-2xl border-slate-200/90 bg-white shadow-[0_8px_30px_-12px_rgba(15,23,42,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-16px_rgba(15,23,42,0.12)]">
                    <CardContent className="p-8">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
                        <Icon className="size-6" aria-hidden />
                      </div>
                      <p className="mt-6 text-xs font-bold uppercase tracking-wider text-slate-400">
                        {s.step}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-900">
                        {s.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
                        {s.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* 4. Features — value */}
      <section className="relative z-10 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Outcomes you can feel — not a feature laundry list
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              We obsess over the job: more conversations worth having, fewer
              leads slipping through.
            </p>
          </div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              {
                title: "More completed fills",
                desc: "Frictionless capture that looks like your product — not a bolt-on widget.",
                icon: Zap,
              },
              {
                title: "Faster first response",
                desc: "When everyone sees the same queue, nobody waits on a forward.",
                icon: LineChart,
              },
              {
                title: "Pipeline you trust",
                desc: "Status and context in one place — forecast from reality, not memory.",
                icon: TrendingUp,
              },
              {
                title: "Private by default",
                desc: "Your leads stay in your workspace — security that matches the promise.",
                icon: Shield,
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} variants={item}>
                  <Card className="h-full rounded-2xl border-slate-200/90 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                    <CardContent className="p-7">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600 text-white shadow-md">
                        <Icon className="size-5" aria-hidden />
                      </div>
                      <h3 className="mt-5 font-semibold text-slate-900">{f.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {f.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* 5. Pricing preview */}
      <section
        id="pricing-preview"
        className="relative z-10 scroll-mt-24 border-y border-slate-200/70 bg-gradient-to-b from-slate-50/80 to-white py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Pricing
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Start lean. Scale when you’re ready.
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Transparent tiers — upgrade when volume deserves it.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {(
              [
                {
                  key: "starter" as const,
                  name: PLAN_PRICING.starter.label,
                  price: PLAN_PRICING.starter.priceInr,
                  blurb: "Solo founders & small teams testing inbound.",
                  highlight: false,
                },
                {
                  key: "growth" as const,
                  name: PLAN_PRICING.growth.label,
                  price: PLAN_PRICING.growth.priceInr,
                  blurb: "The sweet spot for growing revenue teams.",
                  highlight: true,
                },
                {
                  key: "premium" as const,
                  name: PLAN_PRICING.premium.label,
                  price: PLAN_PRICING.premium.priceInr,
                  blurb: "High volume & unlimited forms.",
                  highlight: false,
                },
              ] as const
            ).map((tier) => {
              const limits = PLAN_LIMITS[tier.key];
              return (
                <div
                  key={tier.key}
                  className={cn(
                    "relative flex flex-col rounded-2xl border bg-white p-7 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.1)] transition-all duration-300",
                    tier.highlight
                      ? "z-[1] scale-[1.02] border-primary/35 shadow-[0_20px_50px_-20px_rgba(79,70,229,0.35)] ring-2 ring-primary/15 md:-my-1"
                      : "border-slate-200/90 hover:-translate-y-1 hover:shadow-lg"
                  )}
                >
                  {tier.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="whitespace-nowrap rounded-full bg-gradient-to-r from-primary to-violet-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
                        Most popular
                      </span>
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-slate-900">{tier.name}</h3>
                  <p className="mt-2 min-h-[2.75rem] text-sm text-slate-600">{tier.blurb}</p>
                  <p className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">
                    ₹{tier.price.toLocaleString("en-IN")}
                    <span className="text-base font-normal text-slate-500">/mo</span>
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {limits.creditAllocation.toLocaleString("en-IN")} lead credits ·{" "}
                    {formatFormsLabel(limits.maxForms)} forms
                  </p>
                  <Link
                    href="/pricing"
                    className={cn(
                      buttonVariants({
                        variant: tier.highlight ? "default" : "outline",
                        size: "lg",
                      }),
                      "mt-8 w-full rounded-2xl transition-all duration-200",
                      tier.highlight &&
                        "shadow-md shadow-indigo-500/20 hover:-translate-y-0.5"
                    )}
                  >
                    View pricing
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. ROI */}
      <section className="relative z-10 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Revenue lens
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Earning potential scales with follow-through
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Every qualified lead is a conversation that could close — LeadAap
              helps you show up while intent is still hot.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="mx-auto mt-14 max-w-3xl rounded-2xl border border-indigo-200/50 bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/40 p-8 text-center shadow-inner sm:p-10"
          >
            <p className="text-sm font-medium text-slate-500">Illustrative</p>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              <span className="text-primary">400</span> more qualified leads ×{" "}
              <span className="text-primary">₹10,000</span> avg deal ×{" "}
              <span className="text-primary">10%</span> close
            </p>
            <p className="mt-3 text-lg font-medium text-slate-800">
              ≈ <span className="tabular-nums text-primary">₹40L</span> in opportunity
              — before you spend another rupee on ads.
            </p>
            <p className="mt-4 text-xs text-slate-500">
              Plug in your own numbers; the leverage is in speed and consistency.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 7. Free pilot */}
      <section className="relative z-10 border-y border-emerald-200/40 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 py-20 lg:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white px-4 py-1.5 text-xs font-semibold text-emerald-900 shadow-sm">
            <Check className="size-3.5 text-emerald-600" />
            Zero-risk way to try everything
          </div>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Start with a free pilot — not a leap of faith
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Get full product access for five days. No credit card. If LeadAap
            doesn’t earn a place in your stack, walk away — no guilt, no
            lock-in conversation.
          </p>
          <Link
            href={pilotHref}
            className={cn(
              buttonVariants({ size: "lg" }),
              "group mt-10 inline-flex h-12 min-w-[220px] items-center justify-center rounded-2xl px-8 text-base shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
            )}
          >
            Start free pilot
            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <p className="mt-4 text-sm text-slate-500">
            Full workspace · Cancel anytime · Upgrade only when you’re ready
          </p>
        </div>
      </section>

      {/* 8. Final CTA */}
      <section className="relative z-10 bg-gradient-to-b from-slate-900 to-slate-950 py-24 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to turn traffic into pipeline?
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            See pricing in detail, or start the pilot — most teams are live the
            same day.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href={pilotHref}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 min-w-[200px] rounded-2xl border-0 bg-white px-8 text-base font-semibold text-slate-900 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100"
              )}
            >
              Start free pilot
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link
              href="/pricing"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-12 min-w-[200px] rounded-2xl border-white/25 bg-transparent px-8 text-base text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10"
              )}
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200/80 bg-[#F8FAFC] py-12 text-center text-sm text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-6 sm:flex-row sm:gap-8">
          <span>© {new Date().getFullYear()} LeadAap. All rights reserved.</span>
          <Link href="/pricing" className="font-medium text-primary hover:underline">
            Pricing
          </Link>
        </div>
      </footer>
    </div>
  );
}
