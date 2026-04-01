"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

export function CTABanner({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  className,
}: {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-600 via-indigo-600 to-blue-600 px-6 py-12 text-center shadow-[0_24px_48px_-12px_rgba(79,70,229,0.45)] sm:px-10 sm:py-16",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-blue-400/20 blur-3xl"
        aria-hidden
      />
      <h2 className="relative text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {title}
      </h2>
      <p className="relative mx-auto mt-4 max-w-xl text-pretty text-base text-indigo-100 sm:text-lg">
        {description}
      </p>
      <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
        <Link
          href={primaryHref}
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-12 min-w-[180px] rounded-xl border-0 bg-white text-indigo-700 shadow-lg transition-all duration-200 hover:bg-zinc-50 hover:shadow-xl"
          )}
        >
          {primaryLabel}
          <ArrowRight className="ml-2 size-4" aria-hidden />
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link
            href={secondaryHref}
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "h-12 min-w-[180px] rounded-xl border-white/40 bg-white/10 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20"
            )}
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </motion.div>
  );
}

export const CTASection = CTABanner;
