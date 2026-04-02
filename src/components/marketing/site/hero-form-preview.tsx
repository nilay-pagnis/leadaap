"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const NAME = "Alex Rivera";
const EMAIL = "alex@studio.io";

/** Deterministic “human-ish” delay per character (ms). */
function charDelay(char: string, i: number, prev: string | undefined): number {
  if (char === " ") return 52;
  if (prev === " ") return 38;
  if (i % 7 === 0) return 44;
  return 30 + (i % 3) * 3;
}

const springSnappy = { type: "spring" as const, stiffness: 420, damping: 32 };
const springSoft = { type: "spring" as const, stiffness: 280, damping: 28 };
const springEntrance = { type: "spring" as const, stiffness: 95, damping: 22 };

export function HeroFormPreview() {
  const prefersReducedMotion = useReducedMotion();
  const [nameValue, setNameValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [phase, setPhase] = useState<"typing" | "submitting" | "success">("typing");

  useEffect(() => {
    if (prefersReducedMotion) {
      setNameValue(NAME);
      setEmailValue(EMAIL);
      setPhase("success");
      return;
    }

    let cancelled = false;

    async function sleep(ms: number) {
      await new Promise((r) => setTimeout(r, ms));
    }

    async function runCycle() {
      while (!cancelled) {
        setPhase("typing");
        setNameValue("");
        setEmailValue("");
        for (let i = 0; i <= NAME.length; i++) {
          if (cancelled) return;
          setNameValue(NAME.slice(0, i));
          if (i < NAME.length) {
            const prev = i > 0 ? NAME[i - 1] : undefined;
            await sleep(charDelay(NAME[i]!, i, prev));
          }
        }
        await sleep(280);
        for (let j = 0; j <= EMAIL.length; j++) {
          if (cancelled) return;
          setEmailValue(EMAIL.slice(0, j));
          if (j < EMAIL.length) {
            const prev = j > 0 ? EMAIL[j - 1] : undefined;
            await sleep(charDelay(EMAIL[j]!, j, prev));
          }
        }
        await sleep(420);
        if (cancelled) return;
        setPhase("submitting");
        await sleep(820);
        if (cancelled) return;
        setPhase("success");
        await sleep(3000);
      }
    }

    runCycle();
    return () => {
      cancelled = true;
    };
  }, [prefersReducedMotion]);

  const nameActive =
    phase === "typing" && nameValue.length < NAME.length;
  const emailActive =
    phase === "typing" && nameValue.length >= NAME.length && emailValue.length < EMAIL.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0.2 } : springEntrance}
      className="relative mx-auto w-full max-w-lg lg:max-w-none"
      aria-hidden
    >
      <motion.div
        className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-indigo-500/25 via-violet-500/15 to-blue-500/10 blur-3xl"
        animate={
          prefersReducedMotion
            ? {}
            : {
                opacity: [0.65, 0.95, 0.65],
                scale: [1, 1.02, 1],
              }
        }
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: [0.45, 0, 0.55, 1],
        }}
      />
      <div className="pointer-events-none absolute -inset-px rounded-[1.35rem] bg-gradient-to-br from-indigo-400/40 via-violet-400/25 to-blue-400/35 opacity-60" />

      <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/75 shadow-[0_24px_64px_-20px_rgba(79,70,229,0.25),0_0_0_1px_rgba(255,255,255,0.5)_inset] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200/60 bg-gradient-to-r from-zinc-50/90 to-white/80 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex shrink-0 gap-1.5">
              <span className="size-2.5 rounded-full bg-red-400/85" />
              <span className="size-2.5 rounded-full bg-amber-400/85" />
              <span className="size-2.5 rounded-full bg-emerald-400/85" />
            </div>
            <span className="hidden truncate text-xs font-medium text-zinc-500 sm:inline">
              forms.enquireo.com / project inquiry
            </span>
          </div>
          <motion.span
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-700"
            animate={
              prefersReducedMotion
                ? {}
                : { boxShadow: ["0 0 0 0 rgba(99,102,241,0)", "0 0 0 6px rgba(99,102,241,0.08)", "0 0 0 0 rgba(99,102,241,0)"] }
            }
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="size-3" />
            Live preview
          </motion.span>
        </div>

        <motion.div layout className="relative p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">New form</p>
              <p className="mt-0.5 text-sm font-semibold text-zinc-900">Project inquiry</p>
            </div>
            <motion.div
              className="rounded-lg bg-zinc-100/80 px-2 py-1 text-[10px] font-medium text-zinc-500"
              animate={phase === "typing" && emailValue.length > 0 ? { opacity: [0.7, 1, 0.7] } : { opacity: 1 }}
              transition={{ duration: 1.6, repeat: phase === "typing" && emailValue.length > 0 ? Infinity : 0, ease: "easeInOut" }}
            >
              Auto-saved
            </motion.div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">Full name</label>
              <div className="relative">
                <input
                  readOnly
                  tabIndex={-1}
                  value={nameValue}
                  className={cn(
                    "w-full rounded-xl border bg-white/90 px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition-[box-shadow,border-color] duration-300",
                    nameActive
                      ? "border-indigo-300/90 ring-2 ring-indigo-400/25"
                      : "border-zinc-200/90 ring-0"
                  )}
                />
                {nameActive ? <TypingCursor /> : null}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">Work email</label>
              <div className="relative">
                <input
                  readOnly
                  tabIndex={-1}
                  value={emailValue}
                  className={cn(
                    "w-full rounded-xl border bg-white/90 px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition-[box-shadow,border-color] duration-300",
                    emailActive
                      ? "border-indigo-300/90 ring-2 ring-indigo-400/25"
                      : "border-zinc-200/90 ring-0"
                  )}
                />
                {emailActive ? <TypingCursor /> : null}
              </div>
            </div>
          </div>

          <motion.button
            type="button"
            disabled
            className="relative mt-5 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25"
            animate={
              phase === "submitting"
                ? { scale: [1, 0.992, 1] }
                : phase === "success"
                  ? { scale: [1, 1.015, 1] }
                  : { scale: 1 }
            }
            transition={
              phase === "submitting"
                ? { duration: 0.65, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }
                : phase === "success"
                  ? { duration: 0.48, ease: [0, 0, 0.2, 1] }
                  : springSnappy
            }
          >
            {phase === "submitting" && !prefersReducedMotion ? (
              <motion.span
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
              />
            ) : null}
            {phase === "submitting" ? (
              <>
                <Loader2 className="relative size-4 animate-spin" style={{ animationDuration: "0.65s" }} />
                <span className="relative">Sending…</span>
              </>
            ) : phase === "success" ? (
              <>
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={springSnappy}
                  className="relative inline-flex"
                >
                  <Check className="size-4" strokeWidth={2.5} />
                </motion.span>
                <span className="relative">Submitted</span>
              </>
            ) : (
              "Submit & capture enquiry"
            )}
          </motion.button>

          <AnimatePresence mode="wait">
            {phase === "success" ? (
              <motion.div
                key="success"
                layout
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                transition={prefersReducedMotion ? { duration: 0.15 } : springSoft}
                className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/95 to-white/90 px-3 py-3 shadow-[0_8px_24px_-12px_rgba(16,185,129,0.35)]"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ ...springSnappy, delay: prefersReducedMotion ? 0 : 0.06 }}
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                >
                  <Check className="size-5" strokeWidth={2.5} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...springSoft, delay: prefersReducedMotion ? 0 : 0.1 }}
                >
                  <p className="text-sm font-semibold text-zinc-900">Enquiry captured</p>
                  <p className="text-xs text-zinc-600">Routed to inbox · Slack notified</p>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

function TypingCursor() {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-px origin-center -translate-y-1/2 rounded-full bg-indigo-500"
      animate={{ opacity: [1, 0.2, 1], scaleY: [1, 0.92, 1] }}
      transition={{
        duration: 0.95,
        repeat: Infinity,
        ease: [0.4, 0, 0.6, 1],
      }}
    />
  );
}
