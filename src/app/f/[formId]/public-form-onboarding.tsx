"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { SiteLogo } from "@/components/brand/site-logo";
import { cn } from "@/lib/utils";
import type { FieldRow } from "@/types";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";

const TOTAL_STEPS = 5;

type PublicPayload = {
  form: { id: string; form_name: string };
  fields: FieldRow[];
};

type PilotFields = {
  name: FieldRow;
  email: FieldRow;
  service: FieldRow;
  requirement: FieldRow;
};

function resolvePilotFields(fields: FieldRow[]): PilotFields | null {
  const sorted = [...fields].sort((a, b) => a.sort_order - b.sort_order);
  const name =
    sorted.find((f) => f.type === "text") ??
    sorted.find((f) => f.type === "phone");
  const email = sorted.find((f) => f.type === "email");
  const service = sorted.find((f) => f.type === "select");
  const requirement = sorted.find((f) => f.type === "textarea");
  if (!name || !email || !service || !requirement) return null;
  return { name, email, service, requirement };
}

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 56 : -56,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -56 : 56,
    opacity: 0,
  }),
};

export function PublicFormOnboarding({
  formId,
  source,
  plan,
}: {
  formId: string;
  source: string;
  plan: string;
}) {
  const [payload, setPayload] = useState<PublicPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/public/forms/${formId}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setLoadError(json.error ?? "Could not load form");
          setLoading(false);
          return;
        }
        if (process.env.NODE_ENV === "development") {
          console.debug("[LeadAap public form onboarding]", {
            formId,
            fieldsCount: (json.fields as FieldRow[] | undefined)?.length,
            fields: json.fields,
          });
        }
        setPayload(json);
        const pf = resolvePilotFields(json.fields as FieldRow[]);
        if (!pf) {
          setLoadError(
            "This form needs a text, email, select, and textarea field for the pilot flow."
          );
          setLoading(false);
          return;
        }
        setValues({
          [pf.name.id]: "",
          [pf.email.id]: "",
          [pf.service.id]: "",
          [pf.requirement.id]: "",
        });
        setLoading(false);
      } catch {
        if (!cancelled) {
          setLoadError("Network error");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [formId]);

  const pilotFields = useMemo(
    () => (payload ? resolvePilotFields(payload.fields) : null),
    [payload]
  );

  const validateStep = useCallback(
    (s: number): boolean => {
      if (!pilotFields) return false;
      const { name, email, service, requirement } = pilotFields;
      switch (s) {
        case 0: {
          const v = values[name.id]?.trim() ?? "";
          if (!v) {
            toast.error("Please enter your name");
            return false;
          }
          return true;
        }
        case 1: {
          const v = values[email.id]?.trim() ?? "";
          if (!v) {
            toast.error("Please enter your email");
            return false;
          }
          if (!isValidEmail(v)) {
            toast.error("Enter a valid email address");
            return false;
          }
          return true;
        }
        case 2: {
          const v = values[service.id]?.trim() ?? "";
          if (service.required && !v) {
            toast.error("Please select a service");
            return false;
          }
          return true;
        }
        case 3: {
          const v = values[requirement.id]?.trim() ?? "";
          if (requirement.required && !v) {
            toast.error("Please describe your requirement");
            return false;
          }
          return true;
        }
        default:
          return true;
      }
    },
    [pilotFields, values]
  );

  function goNext() {
    if (!validateStep(step)) return;
    if (step < TOTAL_STEPS - 1) {
      setDirection(1);
      setStep((x) => x + 1);
    }
  }

  function goBack() {
    if (step > 0) {
      setDirection(-1);
      setStep((x) => x - 1);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "Enter") return;
    if (step === TOTAL_STEPS - 1) return;
    const target = e.target as HTMLElement;
    if (target.tagName === "TEXTAREA" && e.shiftKey) return;
    e.preventDefault();
    goNext();
  }

  async function submit() {
    if (!payload || !pilotFields || submitting) return;
    if (!validateStep(0)) {
      setDirection(1);
      setStep(0);
      return;
    }
    if (!validateStep(1)) {
      setDirection(1);
      setStep(1);
      return;
    }
    if (!validateStep(2)) {
      setDirection(1);
      setStep(2);
      return;
    }
    if (!validateStep(3)) {
      setDirection(1);
      setStep(3);
      return;
    }
    setSubmitting(true);
    try {
      const fullData: Record<string, string | boolean> = {};
      for (const f of payload.fields) {
        const v = values[f.id];
        if (v !== undefined) {
          fullData[f.id] = f.type === "checkbox" ? Boolean(v) : v;
        } else if (f.type === "checkbox") {
          fullData[f.id] = false;
        } else {
          fullData[f.id] = "";
        }
      }

      const res = await fetch("/api/public/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          form_id: payload.form.id,
          data: fullData,
          source,
          plan,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Submission failed");
        return;
      }
      setDone(true);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-8 sm:py-12">
        <Skeleton className="mx-auto h-2 w-full max-w-md rounded-full" />
        <Skeleton className="mx-auto mt-8 h-12 w-full rounded-2xl" />
        <Skeleton className="mx-auto mt-6 h-14 w-full rounded-xl" />
      </div>
    );
  }

  if (loadError || !payload || !pilotFields) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-lg font-semibold text-zinc-900">Can’t start pilot</p>
        <p className="mt-2 text-sm text-zinc-600">{loadError}</p>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline" }), "mt-6 inline-flex")}
        >
          Back to website
        </Link>
      </div>
    );
  }

  const { name, email, service, requirement } = pilotFields;
  const serviceOpts = (service.options ?? []).map(String);

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="mx-auto w-full max-w-lg px-4 py-10 sm:py-16"
      >
        <div className="rounded-2xl border border-emerald-200/80 bg-white p-10 text-center shadow-lg shadow-emerald-500/10">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Check className="size-8" strokeWidth={2.5} />
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900">
            You’re all set
          </h1>
          <p className="mt-3 text-base leading-relaxed text-zinc-600">
            We’ll contact you shortly.
          </p>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mt-8 inline-flex h-12 rounded-xl px-8"
            )}
          >
            Back to website
          </Link>
        </div>
      </motion.div>
    );
  }

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <div className="mx-auto w-full max-w-lg flex-1 px-4 pb-10 pt-8 sm:px-6 sm:pt-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <SiteLogo size="md" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
            LeadAap · 5-day pilot
          </p>
          <h1 className="mt-2 text-balance text-xl font-semibold text-zinc-900 sm:text-2xl">
            {payload.form.form_name}
          </h1>
        </div>

        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <span>
              Step {step + 1} of {TOTAL_STEPS}
            </span>
            <span className="tabular-nums">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-200/90">
            <motion.div
              className="h-full rounded-full bg-blue-600"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm sm:p-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onKeyDown={onKeyDown}
              className="min-h-[200px]"
            >
              {step === 0 && (
                <StepField label={name.label} required={name.required}>
                  <Input
                    autoFocus
                    value={values[name.id] ?? ""}
                    onChange={(e) =>
                      setValues((p) => ({ ...p, [name.id]: e.target.value }))
                    }
                    placeholder="Jane Cooper"
                    className="h-14 rounded-xl border-zinc-200 text-base"
                    autoComplete="name"
                  />
                </StepField>
              )}

              {step === 1 && (
                <StepField label={email.label} required={email.required}>
                  <Input
                    autoFocus
                    type="email"
                    inputMode="email"
                    value={values[email.id] ?? ""}
                    onChange={(e) =>
                      setValues((p) => ({ ...p, [email.id]: e.target.value }))
                    }
                    placeholder="you@company.com"
                    className="h-14 rounded-xl border-zinc-200 text-base"
                    autoComplete="email"
                  />
                </StepField>
              )}

              {step === 2 && (
                <StepField label={service.label} required={service.required}>
                  <select
                    autoFocus
                    value={values[service.id] ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setValues((p) => ({ ...p, [service.id]: v }));
                      if (!v.trim()) return;
                      window.setTimeout(() => {
                        setDirection(1);
                        setStep((s) => (s === 2 ? 3 : s));
                      }, 200);
                    }}
                    className={cn(
                      "h-14 w-full rounded-xl border border-zinc-200 bg-white px-4 text-base text-zinc-900",
                      "cursor-pointer transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
                    )}
                  >
                    <option value="">
                      {service.required ? "Choose an option…" : "Optional"}
                    </option>
                    {serviceOpts.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </StepField>
              )}

              {step === 3 && (
                <StepField label={requirement.label} required={requirement.required}>
                  <Textarea
                    autoFocus
                    value={values[requirement.id] ?? ""}
                    onChange={(e) =>
                      setValues((p) => ({
                        ...p,
                        [requirement.id]: e.target.value,
                      }))
                    }
                    placeholder="Tell us what you need…"
                    className="min-h-[160px] rounded-xl border-zinc-200 text-base leading-relaxed"
                  />
                </StepField>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-zinc-900">Review</h2>
                  <ul className="space-y-4 text-sm">
                    <ReviewRow label={name.label} value={values[name.id]} />
                    <ReviewRow label={email.label} value={values[email.id]} />
                    <ReviewRow label={service.label} value={values[service.id]} />
                    <ReviewRow
                      label={requirement.label}
                      value={values[requirement.id]}
                      multiline
                    />
                    <li className="flex flex-col gap-1 border-t border-zinc-100 pt-4 sm:flex-row sm:justify-between">
                      <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                        Source
                      </span>
                      <span className="font-medium text-zinc-900">{source}</span>
                    </li>
                    <li className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                      <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                        Plan
                      </span>
                      <span className="font-medium text-zinc-900">{plan}</span>
                    </li>
                  </ul>
                  <Button
                    type="button"
                    className="h-14 w-full rounded-xl text-base font-semibold shadow-md"
                    disabled={submitting}
                    onClick={() => void submit()}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 size-5 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        Submit
                        <ArrowRight className="ml-2 size-5" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {step < 4 && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                className="h-12 order-2 rounded-xl sm:order-1"
                onClick={goBack}
                disabled={step === 0}
              >
                <ArrowLeft className="mr-2 size-4" />
                Back
              </Button>
              <Button
                type="button"
                className="h-12 order-1 rounded-xl sm:order-2 sm:min-w-[140px]"
                onClick={goNext}
              >
                Next
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Press Enter to continue · Your data is encrypted in transit
        </p>
      </div>
    </div>
  );
}

function StepField({
  label,
  required,
  children,
}: {
  label: string;
  required: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium text-zinc-800">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </Label>
      {children}
    </div>
  );
}

function ReviewRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <li
      className={cn(
        "flex flex-col gap-1 border-b border-zinc-100 pb-4 last:border-0 sm:flex-row sm:justify-between sm:gap-6",
        multiline && "sm:items-start"
      )}
    >
      <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </span>
      <span
        className={cn(
          "min-w-0 text-right font-medium text-zinc-900",
          multiline && "whitespace-pre-wrap text-left text-sm leading-relaxed sm:text-right"
        )}
      >
        {value?.trim() || "—"}
      </span>
    </li>
  );
}
