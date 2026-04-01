"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

export function UseCaseCard({
  icon: Icon,
  title,
  description,
  href = "/signup",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
    >
      <div className="gradient-border-wrap h-full rounded-2xl transition-shadow duration-300 hover:shadow-[0_22px_50px_-20px_rgba(99,102,241,0.35)]">
        <Link
          href={href}
          className="group flex h-full flex-col rounded-[0.98rem] border border-white/80 bg-white/90 p-6 shadow-[0_8px_28px_-14px_rgba(15,23,42,0.12)] backdrop-blur-md transition-all duration-300 hover:bg-white sm:p-7"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/12 to-violet-500/10 text-indigo-600 ring-1 ring-indigo-500/12">
              <Icon className="size-5" aria-hidden />
            </div>
            <ArrowUpRight className="size-4 text-zinc-400 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-indigo-600" />
          </div>
          <h3 className="mt-5 text-lg font-semibold tracking-tight text-zinc-900">{title}</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600">{description}</p>
          <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Open workflow
            <ArrowUpRight className="size-3.5 -rotate-0 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </motion.div>
  );
}
