"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";
import { ProductMockup } from "./product-mockup";
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
      className="relative overflow-hidden border-b border-zinc-200/60 bg-gradient-to-b from-white via-zinc-50/80 to-zinc-50"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.12),transparent)]"
        aria-hidden
      />
      <SectionWrapper className="relative grid gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-28">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="text-center lg:text-left"
        >
          <motion.p
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white px-4 py-1.5 text-xs font-medium text-zinc-600 shadow-sm"
          >
            <Sparkles className="size-3.5 text-indigo-500" aria-hidden />
            No code · Live in minutes
          </motion.p>
          <motion.h1
            id="hero-heading"
            variants={fadeUp}
            className="mt-6 text-balance text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]"
          >
            Turn every visitor into a qualified lead — in seconds.
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-zinc-600 lg:mx-0"
          >
            LeadApp is the calm way to publish forms, share links, and watch responses land in one
            inbox — so your team can follow up while intent is still hot.
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start"
          >
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 min-w-[160px] rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:from-indigo-500 hover:to-blue-500 hover:shadow-xl"
              )}
            >
              Start free
              <ArrowRight className="ml-2 size-4" aria-hidden />
            </Link>
            <Link
              href="/#product"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-12 min-w-[160px] rounded-xl border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:bg-zinc-50"
              )}
            >
              View demo
            </Link>
          </motion.div>
        </motion.div>
        <div id="product" className="relative lg:pl-4">
          <ProductMockup />
        </div>
      </SectionWrapper>
    </section>
  );
}
