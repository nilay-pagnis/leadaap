"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";

const NAME = "Alex Rivera";
const EMAIL = "alex@studio.io";

export function HeroFormPreview() {
  const [nameValue, setNameValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [phase, setPhase] = useState<"typing" | "submitting" | "success">("typing");

  useEffect(() => {
    let cancelled = false;

    async function runCycle() {
      while (!cancelled) {
        setPhase("typing");
        setNameValue("");
        setEmailValue("");
        for (let i = 0; i <= NAME.length; i++) {
          if (cancelled) return;
          setNameValue(NAME.slice(0, i));
          await new Promise((r) => setTimeout(r, 38));
        }
        await new Promise((r) => setTimeout(r, 200));
        for (let j = 0; j <= EMAIL.length; j++) {
          if (cancelled) return;
          setEmailValue(EMAIL.slice(0, j));
          await new Promise((r) => setTimeout(r, 32));
        }
        await new Promise((r) => setTimeout(r, 450));
        if (cancelled) return;
        setPhase("submitting");
        await new Promise((r) => setTimeout(r, 700));
        if (cancelled) return;
        setPhase("success");
        await new Promise((r) => setTimeout(r, 2600));
      }
    }

    runCycle();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-lg lg:max-w-none"
      aria-hidden
    >
      <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-indigo-500/25 via-violet-500/15 to-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -inset-px rounded-[1.35rem] bg-gradient-to-br from-indigo-400/40 via-violet-400/25 to-blue-400/35 opacity-60" />

      <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/75 shadow-[0_24px_64px_-20px_rgba(79,70,229,0.25),0_0_0_1px_rgba(255,255,255,0.5)_inset] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200/60 bg-gradient-to-r from-zinc-50/90 to-white/80 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-red-400/85" />
              <span className="size-2.5 rounded-full bg-amber-400/85" />
              <span className="size-2.5 rounded-full bg-emerald-400/85" />
            </div>
            <span className="hidden text-xs font-medium text-zinc-500 sm:inline">
              forms.enquireo.com / project inquiry
            </span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-700">
            <Sparkles className="size-3" />
            Live preview
          </span>
        </div>

        <div className="relative p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">New form</p>
              <p className="mt-0.5 text-sm font-semibold text-zinc-900">Project inquiry</p>
            </div>
            <div className="rounded-lg bg-zinc-100/80 px-2 py-1 text-[10px] font-medium text-zinc-500">
              Auto-saved
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">Full name</label>
              <div className="relative">
                <input
                  readOnly
                  tabIndex={-1}
                  value={nameValue}
                  className="w-full rounded-xl border border-zinc-200/90 bg-white/90 px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none ring-0"
                />
                {phase === "typing" && nameValue.length < NAME.length ? (
                  <span className="pointer-events-none absolute right-3 top-1/2 h-4 w-px -translate-y-1/2 animate-pulse bg-indigo-500" />
                ) : null}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">Work email</label>
              <div className="relative">
                <input
                  readOnly
                  tabIndex={-1}
                  value={emailValue}
                  className="w-full rounded-xl border border-zinc-200/90 bg-white/90 px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none"
                />
                {phase === "typing" && nameValue.length >= NAME.length && emailValue.length < EMAIL.length ? (
                  <span className="pointer-events-none absolute right-3 top-1/2 h-4 w-px -translate-y-1/2 animate-pulse bg-indigo-500" />
                ) : null}
              </div>
            </div>
          </div>

          <motion.button
            type="button"
            disabled
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25"
            animate={
              phase === "submitting"
                ? { scale: [1, 0.98, 1] }
                : phase === "success"
                  ? { scale: [1, 1.02, 1] }
                  : {}
            }
            transition={{ duration: 0.35 }}
          >
            {phase === "submitting" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending…
              </>
            ) : phase === "success" ? (
              <>
                <Check className="size-4" />
                Submitted
              </>
            ) : (
              "Submit & capture enquiry"
            )}
          </motion.button>

          <AnimatePresence mode="wait">
            {phase === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/95 to-white/90 px-3 py-3 shadow-[0_8px_24px_-12px_rgba(16,185,129,0.35)]"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
                  <Check className="size-5" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">Enquiry captured</p>
                  <p className="text-xs text-zinc-600">
                    Routed to inbox · Slack notified
                  </p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
