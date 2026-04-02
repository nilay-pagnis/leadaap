"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";
import { HeroFormPreview } from "./hero-form-preview";
import { SectionWrapper } from "./section-wrapper";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden border-b border-zinc-200/50 bg-gradient-to-b from-white via-indigo-50/[0.35] to-zinc-50/90"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-25%,rgba(99,102,241,0.14),transparent_60%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 top-1/4 size-[520px] rounded-full bg-violet-400/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 bottom-0 size-[420px] rounded-full bg-blue-400/12 blur-3xl"
        aria-hidden
      />
      <SectionWrapper className="relative grid gap-10 py-12 sm:gap-12 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="text-center lg:text-left"
        >
          <motion.p
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-4 py-1.5 text-xs font-medium text-zinc-600 shadow-[0_8px_30px_-12px_rgba(79,70,229,0.2)] backdrop-blur-sm"
          >
            <Sparkles className="size-3.5 text-indigo-500" aria-hidden />
            Capture. Qualify. Convert.
          </motion.p>
          <motion.h1
            id="hero-heading"
            variants={fadeUp}
            className="mt-6 text-balance text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl lg:text-[3.15rem] lg:leading-[1.08]"
          >
            Turn every enquiry into a qualified opportunity
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-zinc-600 lg:mx-0"
          >
            Capture. Qualify. Convert. — all in one powerful system.
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start"
          >
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "marketing-cta-primary h-12 min-w-[160px]"
              )}
            >
              Start Free
              <ArrowRight className="ml-2 size-4" aria-hidden />
            </Link>
            <Link
              href="/#product"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-12 min-w-[160px] rounded-xl border-zinc-200/90 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-indigo-200 hover:bg-white hover:shadow-md"
              )}
            >
              See Demo
            </Link>
          </motion.div>
          <motion.p variants={fadeUp} className="mt-3 text-xs font-medium text-zinc-500">
            No credit card required
          </motion.p>
          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200">
              <BadgeCheck className="size-3.5 text-emerald-600" /> Trusted checkout
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200">
              <BadgeCheck className="size-3.5 text-emerald-600" /> Secure enquiry forms
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200">
              <BadgeCheck className="size-3.5 text-emerald-600" /> Built for mobile
            </span>
          </motion.div>
        </motion.div>
        <div id="product" className="relative lg:pl-2">
          <HeroFormPreview />
        </div>
      </SectionWrapper>
    </section>
  );
}
