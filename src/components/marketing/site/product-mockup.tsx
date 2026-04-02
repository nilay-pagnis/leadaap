"use client";

import { motion } from "framer-motion";
import { Inbox, LineChart, Users } from "lucide-react";

export function ProductMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
      aria-hidden
    >
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-indigo-500/20 via-blue-500/10 to-transparent blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_24px_64px_-16px_rgba(15,23,42,0.2)]">
        <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/80 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-red-400/80" />
            <span className="size-2.5 rounded-full bg-amber-400/80" />
            <span className="size-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <span className="ml-2 text-xs font-medium text-zinc-400">app.enquireo.com / inbox</span>
        </div>
        <div className="grid gap-4 p-5 sm:p-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "New enquiries", value: "128", icon: Users, tone: "text-indigo-600" },
              { label: "Forms live", value: "6", icon: LineChart, tone: "text-blue-600" },
              { label: "Inbox", value: "24", icon: Inbox, tone: "text-violet-600" },
            ].map((k) => (
              <div
                key={k.label}
                className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 sm:p-4"
              >
                <k.icon className={`size-4 ${k.tone}`} />
                <p className="mt-2 text-lg font-semibold tabular-nums text-zinc-900">{k.value}</p>
                <p className="text-xs font-medium text-zinc-500">{k.label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2 rounded-xl border border-zinc-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Latest</p>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-lg bg-zinc-50 px-3 py-2.5"
              >
                <div className="h-2 flex-1 max-w-[55%] rounded-full bg-zinc-200" />
                <div className="h-2 w-16 rounded-full bg-emerald-200/80" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
