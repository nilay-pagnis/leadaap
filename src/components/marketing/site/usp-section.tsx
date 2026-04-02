"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BadgeCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";
import { SectionWrapper } from "./section-wrapper";

export function USPSection() {
  return (
    <section className="relative border-y border-indigo-200/40 bg-gradient-to-b from-white via-indigo-50/[0.35] to-zinc-50/90 py-20 sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(99,102,241,0.12),transparent_65%)]"
        aria-hidden
      />
      <SectionWrapper className="relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/60 bg-white/75 p-6 shadow-[0_24px_64px_-24px_rgba(79,70,229,0.35),0_0_0_1px_rgba(255,255,255,0.6)_inset] backdrop-blur-xl sm:p-10">
          <div
            className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-indigo-400/25 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 -left-20 size-64 rounded-full bg-violet-400/20 blur-3xl"
            aria-hidden
          />

          <div className="relative flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="size-3.5 text-indigo-100" aria-hidden />
              Free Plan
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/90 bg-emerald-50/90 px-2.5 py-1 text-xs font-semibold text-emerald-800">
              <BadgeCheck className="size-3.5" aria-hidden />
              No credit card
            </span>
          </div>

          <h2 className="relative mt-8 text-balance text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Start free — full product, zero risk
          </h2>
          <p className="relative mt-3 max-w-xl text-base text-zinc-600 sm:text-lg">
            Ship your first capture flow in minutes. Everything below is included on the free tier.
          </p>

          <ul className="relative mt-8 grid gap-4 sm:grid-cols-2">
            <li className="flex items-start gap-3 rounded-xl border border-indigo-100/90 bg-gradient-to-br from-indigo-50/90 to-white/80 px-4 py-3.5 shadow-sm">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-md shadow-indigo-500/25">
                1
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-900">1 live form</p>
                <p className="text-xs text-zinc-600">Publish a polished form and share the link anywhere.</p>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-xl border border-violet-100/90 bg-gradient-to-br from-violet-50/80 to-white/80 px-4 py-3.5 shadow-sm">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold text-white shadow-md shadow-violet-500/25">
                10
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-900">10 enquiry credits</p>
                <p className="text-xs text-zinc-600">Enough to prove inbound before you scale.</p>
              </div>
            </li>
          </ul>

          <div className="relative mt-8">
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "marketing-cta-primary h-12 min-w-[180px]"
              )}
            >
              Start for free
            </Link>
            <p className="mt-3 text-xs font-medium text-zinc-500">No credit card required</p>
          </div>
        </motion.div>
      </SectionWrapper>
    </section>
  );
}
