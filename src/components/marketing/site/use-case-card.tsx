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
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link
        href={href}
        className="group block rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-[0_8px_24px_-12px_rgba(2,6,23,0.15)] transition-shadow duration-300 hover:shadow-[0_18px_40px_-18px_rgba(79,70,229,0.35)] sm:p-7"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 text-indigo-600 ring-1 ring-indigo-500/10">
            <Icon className="size-5" aria-hidden />
          </div>
          <ArrowUpRight className="size-4 text-zinc-400 transition-colors group-hover:text-indigo-600" />
        </div>
        <h3 className="mt-5 text-lg font-semibold tracking-tight text-zinc-900">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">{description}</p>
      </Link>
    </motion.div>
  );
}
