"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.22 } }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/70 bg-white/85 p-6 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_16px_40px_-16px_rgba(79,70,229,0.12)] backdrop-blur-md transition-shadow duration-300 hover:shadow-[0_20px_48px_-18px_rgba(79,70,229,0.22)] sm:p-8",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      >
        <div className="absolute -right-12 -top-12 size-40 rounded-full bg-indigo-400/15 blur-2xl" />
      </div>
      <div className="relative flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/10 text-indigo-600 ring-1 ring-indigo-500/15">
        <Icon className="size-5" aria-hidden />
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-zinc-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">{description}</p>
    </motion.article>
  );
}
