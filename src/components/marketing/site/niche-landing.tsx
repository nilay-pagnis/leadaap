"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { BadgeCheck, CheckCircle2, ArrowRight } from "lucide-react";
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Camera,
  ClipboardList,
  FolderKanban,
  Handshake,
  Link2,
  MessagesSquare,
  Target,
  UserRound,
  WandSparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";
import { SectionWrapper } from "./section-wrapper";
import { CTABanner } from "./cta-banner";
import { UseCaseCard } from "./use-case-card";

export type IconName =
  | "folder-kanban"
  | "clipboard-list"
  | "briefcase"
  | "bar-chart"
  | "link"
  | "messages"
  | "handshake"
  | "target"
  | "building"
  | "camera"
  | "user"
  | "wand";

type Item = { icon: IconName; title: string; description: string };
type UseCase = { icon: IconName; title: string; description: string };

export type UseCasePageContent = {
  hero: {
    headline: string;
    subtext: string;
    primaryCta: string;
    secondaryCta: string;
    secondaryHref: string;
  };
  painTitle: string;
  painPoints: string[];
  solutionTitle: string;
  solutions: Item[];
  howItWorksTitle: string;
  howItWorksSteps: { icon: IconName; title: string; body: string }[];
  roiMessage: string;
  useCasesTitle: string;
  useCases: UseCase[];
  uspText: string;
  finalCta: {
    title: string;
    description: string;
    label: string;
  };
};

const iconMap: Record<IconName, LucideIcon> = {
  "folder-kanban": FolderKanban,
  "clipboard-list": ClipboardList,
  briefcase: BriefcaseBusiness,
  "bar-chart": BarChart3,
  link: Link2,
  messages: MessagesSquare,
  handshake: Handshake,
  target: Target,
  building: Building2,
  camera: Camera,
  user: UserRound,
  wand: WandSparkles,
};

export function HeroSection({
  headline,
  subtext,
  primaryCta,
  primaryHref,
  secondaryCta,
  secondaryHref,
}: {
  headline: string;
  subtext: string;
  primaryCta: string;
  primaryHref: string;
  secondaryCta: string;
  secondaryHref: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-zinc-200/70 bg-gradient-to-b from-white via-zinc-50/70 to-zinc-50 py-16 sm:py-20 lg:py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-20%,rgba(79,70,229,0.14),transparent)]"
        aria-hidden
      />
      <SectionWrapper className="relative">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600 shadow-sm">
            <BadgeCheck className="size-3.5" />
            From clicks to clients - in one link.
          </p>
          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
            {headline}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-zinc-600 sm:text-xl">
            {subtext}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={primaryHref}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 min-w-[190px] rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-blue-500"
              )}
            >
              {primaryCta}
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link
              href={secondaryHref}
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-12 min-w-[190px] rounded-xl border-zinc-200 bg-white shadow-sm hover:bg-zinc-50"
              )}
            >
              {secondaryCta}
            </Link>
          </div>
          <p className="mt-3 text-xs font-medium text-zinc-500">No credit card required</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {["Trusted by modern teams", "Secure form links", "Mobile ready"].map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600"
              >
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                {b}
              </span>
            ))}
          </div>
        </motion.div>
      </SectionWrapper>
    </section>
  );
}

export function PainSection({ title, points }: { title: string; points: string[] }) {
  return (
    <section className="border-b border-zinc-200/70 bg-white py-14 sm:py-18">
      <SectionWrapper>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl rounded-2xl border border-rose-200/70 bg-gradient-to-br from-rose-50/70 via-white to-orange-50/50 p-6 shadow-sm sm:p-8"
        >
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">{title}</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-2 text-sm text-zinc-700 sm:text-base">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-rose-500" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </SectionWrapper>
    </section>
  );
}

export function SolutionGrid({ title, items }: { title: string; items: Item[] }) {
  return (
    <section className="py-16 sm:py-22">
      <SectionWrapper>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">{title}</h2>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {items.map((item, idx) => {
            const Icon = iconMap[item.icon];
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-[0_8px_24px_-14px_rgba(2,6,23,0.18)] hover:shadow-[0_16px_40px_-16px_rgba(79,70,229,0.2)]"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-zinc-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </SectionWrapper>
    </section>
  );
}

export function UseCaseCards({ title, cases }: { title: string; cases: UseCase[] }) {
  return (
    <section className="border-y border-zinc-200/70 bg-zinc-50/60 py-16 sm:py-22">
      <SectionWrapper>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">{title}</h2>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => {
            const Icon = iconMap[c.icon];
            return <UseCaseCard key={c.title} icon={Icon} title={c.title} description={c.description} />;
          })}
        </div>
      </SectionWrapper>
    </section>
  );
}

export function ROISection({ message }: { message: string }) {
  return (
    <section className="py-14 sm:py-18">
      <SectionWrapper>
        <div className="mx-auto max-w-4xl rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/70 p-8 text-center shadow-[0_16px_40px_-20px_rgba(79,70,229,0.35)] sm:p-10">
          <p className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">{message}</p>
        </div>
      </SectionWrapper>
    </section>
  );
}

export function USPBanner({ text }: { text: string }) {
  return (
    <section className="pb-6">
      <SectionWrapper>
        <div className="mx-auto max-w-3xl rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-5 text-center sm:p-6">
          <p className="text-base font-semibold text-emerald-800 sm:text-lg">{text}</p>
        </div>
      </SectionWrapper>
    </section>
  );
}

export function TestimonialsPlaceholder() {
  return (
    <section className="py-16 sm:py-20">
      <SectionWrapper>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Loved by teams like yours
          </h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            "“We stopped losing inquiries and closed faster this quarter.”",
            "“Enquiry quality improved immediately once we added qualification.”",
            "“The cleanest enquiry workflow we’ve used so far.”",
          ].map((quote) => (
            <div
              key={quote}
              className="rounded-2xl border border-zinc-200/80 bg-white p-6 text-sm leading-relaxed text-zinc-700 shadow-sm"
            >
              {quote}
            </div>
          ))}
        </div>
      </SectionWrapper>
    </section>
  );
}

export function CTASection({
  title,
  description,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaLabel: string;
}) {
  return (
    <SectionWrapper className="py-14 sm:py-20">
      <CTABanner
        title={title}
        description={description}
        primaryHref="/signup"
        primaryLabel={ctaLabel}
        secondaryHref="/pricing"
        secondaryLabel="See plans"
        microcopy="No credit card required"
      />
    </SectionWrapper>
  );
}

export function HowItWorks({
  title,
  steps,
}: {
  title: string;
  steps: { icon: IconName; title: string; body: string }[];
}) {
  return (
    <section className="border-y border-zinc-200/70 bg-white py-16 sm:py-22">
      <SectionWrapper>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">{title}</h2>
        </div>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((step, idx) => {
            const Icon = iconMap[step.icon];
            return (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-6 shadow-sm"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-zinc-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{step.body}</p>
              </motion.li>
            );
          })}
        </ol>
      </SectionWrapper>
    </section>
  );
}

export function UseCaseLandingPage({ content }: { content: UseCasePageContent }) {
  return (
    <>
      <HeroSection
        headline={content.hero.headline}
        subtext={content.hero.subtext}
        primaryCta={content.hero.primaryCta}
        primaryHref="/signup"
        secondaryCta={content.hero.secondaryCta}
        secondaryHref={content.hero.secondaryHref}
      />
      <PainSection title={content.painTitle} points={content.painPoints} />
      <SolutionGrid title={content.solutionTitle} items={content.solutions} />
      <HowItWorks title={content.howItWorksTitle} steps={content.howItWorksSteps} />
      <ROISection message={content.roiMessage} />
      <UseCaseCards title={content.useCasesTitle} cases={content.useCases} />
      <USPBanner text={content.uspText} />
      <TestimonialsPlaceholder />
      <CTASection
        title={content.finalCta.title}
        description={content.finalCta.description}
        ctaLabel={content.finalCta.label}
      />
    </>
  );
}
