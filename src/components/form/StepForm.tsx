"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  Plus,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { FieldRow } from "@/types";
import { FormHeader } from "./FormHeader";
import { ProgressBar } from "./ProgressBar";

const CHUNK = 3;

type PublicPayload = {
  form: {
    id: string;
    form_name: string;
    company_name?: string | null;
  };
  fields: FieldRow[];
};

function sortFields(fields: FieldRow[]) {
  return [...fields].sort((a, b) => a.sort_order - b.sort_order);
}

function chunkFields(fields: FieldRow[]): FieldRow[][] {
  const sorted = sortFields(fields);
  if (sorted.length === 0) return [];
  const out: FieldRow[][] = [];
  for (let i = 0; i < sorted.length; i += CHUNK) {
    out.push(sorted.slice(i, i + CHUNK));
  }
  return out;
}

function stepTitle(group: FieldRow[], index: number): string {
  const first = group[0]?.label?.trim();
  if (!first) return `Step ${index + 1}`;
  return first.length > 34 ? `${first.slice(0, 32)}…` : first;
}

function validateFields(
  fields: FieldRow[],
  vals: Record<string, string | boolean>
): boolean {
  for (const f of fields) {
    if (!f.required) continue;
    const v = vals[f.id];
    if (f.type === "checkbox") {
      if (!v) {
        toast.error(`Please confirm: ${f.label}`);
        return false;
      }
      continue;
    }
    if (v === undefined || v === null || String(v).trim() === "") {
      toast.error(`Please fill: ${f.label}`);
      return false;
    }
  }
  return true;
}

export function StepFormLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-10 sm:pt-14">
      <Skeleton className="mx-auto mb-10 h-10 max-w-md rounded-xl" />
      <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl sm:p-10">
        <Skeleton className="mx-auto h-8 w-48 rounded-lg" />
        <Skeleton className="mx-auto mt-3 h-4 w-full max-w-lg" />
        <div className="mt-10 space-y-6">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function StepForm({ formId }: { formId: string }) {
  const [payload, setPayload] = useState<PublicPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const submitLock = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/public/forms/${formId}`, {
          cache: "no-store",
        });
        const json = (await res.json()) as PublicPayload & { error?: string };
        if (cancelled) return;
        if (!res.ok) {
          setLoadError(json.error ?? "Could not load form");
          setLoading(false);
          return;
        }
        setPayload(json);
        const initial: Record<string, string | boolean> = {};
        for (const f of json.fields) {
          if (f.type === "checkbox") initial[f.id] = false;
          else initial[f.id] = "";
        }
        setValues(initial);
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

  const groups = useMemo(
    () => (payload ? chunkFields(payload.fields) : []),
    [payload]
  );
  const totalSteps = Math.max(groups.length, 1);
  const progress = groups.length === 0 ? 0 : (stepIndex + 1) / totalSteps;
  const isLast = stepIndex >= groups.length - 1;
  const currentFields = useMemo(
    () => groups[stepIndex] ?? [],
    [groups, stepIndex]
  );

  const goNext = useCallback(() => {
    if (!validateFields(currentFields, values)) return;
    setStepIndex((i) => Math.min(i + 1, Math.max(groups.length - 1, 0)));
  }, [currentFields, values, groups.length]);

  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const jumpTo = useCallback(
    (i: number) => {
      if (i < stepIndex) setStepIndex(i);
    },
    [stepIndex]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!payload || submitLock.current || submitting) return;
    const all = sortFields(payload.fields);
    if (!validateFields(all, values)) return;
    submitLock.current = true;
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          form_id: payload.form.id,
          data: values,
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
      submitLock.current = false;
      setSubmitting(false);
    }
  }

  function resetForAnother() {
    if (!payload) return;
    const initial: Record<string, string | boolean> = {};
    for (const f of payload.fields) {
      if (f.type === "checkbox") initial[f.id] = false;
      else initial[f.id] = "";
    }
    setValues(initial);
    setDone(false);
    setStepIndex(0);
    submitLock.current = false;
  }

  if (loading) {
    return <StepFormLoading />;
  }

  if (loadError || !payload) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-lg font-semibold text-slate-900">Form unavailable</p>
        <p className="mt-2 text-sm text-slate-600">{loadError}</p>
      </div>
    );
  }

  if (payload.fields.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-lg font-semibold text-slate-900">No fields yet</p>
        <p className="mt-2 text-sm text-slate-600">
          This form doesn&apos;t have any questions configured.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <>
        <ProgressBar progress={1} />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className="mx-auto w-full max-w-2xl px-4 pb-16 pt-10 sm:pt-14"
        >
          <div className="rounded-3xl border border-emerald-200/80 bg-white p-10 text-center shadow-[0_24px_64px_-24px_rgba(16,185,129,0.25)] sm:p-12">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-9" />
            </div>
            <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
              Your request has been submitted
            </h2>
            <p className="mt-3 text-slate-600">
              Thanks — we&apos;ll be in touch shortly.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-8 rounded-2xl"
              onClick={resetForAnother}
            >
              <RotateCcw className="mr-2 size-4" />
              Submit another response
            </Button>
          </div>
        </motion.div>
      </>
    );
  }

  return (
    <>
      <ProgressBar progress={progress} />

      {/* Top nav — Stitch-style */}
      <header className="sticky top-1 z-50 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F46E5] to-violet-600 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="size-4" />
            </div>
            <span className="truncate text-lg font-bold tracking-tight text-slate-900">
              LeadAap
            </span>
          </div>

          <nav
            className="hidden min-w-0 flex-1 justify-center gap-1 md:flex"
            aria-label="Form steps"
          >
            {groups.map((g, i) => {
              const active = i === stepIndex;
              const past = i < stepIndex;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => past && jumpTo(i)}
                  disabled={!past && !active}
                  className={cn(
                    "max-w-[140px] truncate rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    active &&
                      "bg-[#4F46E5]/10 text-[#4F46E5] ring-1 ring-[#4F46E5]/25",
                    past &&
                      "cursor-pointer text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    !past &&
                      !active &&
                      "cursor-default text-slate-400 opacity-60"
                  )}
                >
                  {stepTitle(g, i)}
                </button>
              );
            })}
          </nav>

          <div className="w-[72px] shrink-0" aria-hidden />
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-8 sm:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_24px_64px_-28px_rgba(15,23,42,0.18)] sm:p-10"
        >
          <FormHeader
            companyName={payload.form.company_name}
            formName={payload.form.form_name}
          />

          <p className="mt-4 text-center text-sm font-medium text-slate-500 md:hidden">
            Step {stepIndex + 1} of {totalSteps}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={stepIndex}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-10"
              >
                {currentFields.map((field, fi) => {
                  const n = stepIndex * CHUNK + fi + 1;
                  if (field.type === "checkbox") {
                    return (
                      <div key={field.id} className="flex gap-3">
                        <span
                          className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#4F46E5]/10 text-xs font-bold text-[#4F46E5]"
                          aria-hidden
                        >
                          {n}
                        </span>
                        <div className="min-w-0 flex-1">
                          <StitchFieldInput
                            field={field}
                            value={values[field.id]}
                            onChange={(v) =>
                              setValues((prev) => ({ ...prev, [field.id]: v }))
                            }
                          />
                        </div>
                      </div>
                    );
                  }
                  return (
                    <section key={field.id}>
                      <div className="mb-4 flex items-start gap-3">
                        <span
                          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#4F46E5]/10 text-xs font-bold text-[#4F46E5]"
                          aria-hidden
                        >
                          {n}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-lg font-semibold text-[#111827] sm:text-xl">
                            {field.label}
                            {field.required ? (
                              <span className="text-red-500"> *</span>
                            ) : null}
                          </h2>
                        </div>
                      </div>
                      <StitchFieldInput
                        field={field}
                        value={values[field.id]}
                        onChange={(v) =>
                          setValues((prev) => ({ ...prev, [field.id]: v }))
                        }
                      />
                    </section>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-8 sm:flex-row sm:items-center sm:justify-between">
              {stepIndex > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-12 rounded-2xl text-slate-600 hover:text-slate-900"
                  onClick={goBack}
                >
                  Back
                </Button>
              ) : (
                <span />
              )}
              {!isLast ? (
                <Button
                  type="button"
                  onClick={goNext}
                  className="group h-14 min-w-[200px] flex-1 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#6366F1] text-base font-semibold text-white shadow-lg shadow-indigo-500/25 sm:ml-auto sm:max-w-xs"
                >
                  Continue
                  <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={submitting}
                  className="group h-14 min-w-[200px] flex-1 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#6366F1] text-base font-semibold text-white shadow-lg shadow-indigo-500/30 sm:ml-auto sm:max-w-xs"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 size-5 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Submit request
                      <span className="ml-2" aria-hidden>
                        🚀
                      </span>
                      <ArrowRight className="ml-1 size-5 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="flex flex-col items-center justify-center gap-4 border-t border-slate-100 pt-8 sm:flex-row sm:gap-10">
              <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                <Check className="size-4 shrink-0 text-[#4F46E5]" aria-hidden />
                Your data is secure
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                <Check className="size-4 shrink-0 text-[#4F46E5]" aria-hidden />
                We respond within 24 hours
              </span>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}

const StitchFieldInput = memo(function StitchFieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldRow;
  value: string | boolean | undefined;
  onChange: (v: string | boolean) => void;
}) {
  const id = `stitch-${field.id}`;
  const opts = Array.isArray(field.options)
    ? field.options.map(String)
    : [];

  const shell =
    "rounded-xl border-0 bg-[#F3F4F6] px-4 py-3 text-[#111827] placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#4F46E5]/35";

  switch (field.type) {
    case "checkbox":
      return (
        <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <Checkbox
            id={id}
            checked={Boolean(value)}
            onCheckedChange={(c) => onChange(Boolean(c))}
            className="mt-1 border-slate-300 data-[state=checked]:bg-[#4F46E5] data-[state=checked]:text-white"
          />
          <Label htmlFor={id} className="cursor-pointer text-sm leading-relaxed text-slate-800">
            {field.label}
            {field.required ? <span className="text-red-500"> *</span> : null}
          </Label>
        </div>
      );

    case "textarea":
      return (
        <Textarea
          id={id}
          required={field.required}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tell us more about what you're building..."
          className={cn(shell, "min-h-[140px] resize-y text-base")}
        />
      );

    case "select":
      if (opts.length === 0) {
        return (
          <select
            id={id}
            required={field.required}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className={cn(shell, "h-12 w-full cursor-pointer px-3 text-base")}
          >
            <option value="">
              {field.required ? "Choose an option…" : "Optional"}
            </option>
            {opts.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        );
      }
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {opts.map((opt) => {
            const selected = String(value ?? "") === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={cn(
                  "flex min-h-[3.75rem] items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all duration-200 motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.99]",
                  selected
                    ? "border-[#4F46E5] bg-[#4F46E5] text-white shadow-md shadow-indigo-500/20"
                    : "border-slate-200 bg-[#F3F4F6] text-slate-900 hover:border-slate-300 hover:bg-slate-100"
                )}
              >
                <span className="leading-snug">{opt}</span>
                {selected ? (
                  <Check className="size-5 shrink-0 text-white" aria-hidden />
                ) : (
                  <Plus className="size-5 shrink-0 text-slate-400" aria-hidden />
                )}
              </button>
            );
          })}
        </div>
      );

    default: {
      const inputType =
        field.type === "email"
          ? "email"
          : field.type === "phone"
            ? "tel"
            : "text";
      const placeholder =
        field.type === "email"
          ? "jane@company.com"
          : field.type === "phone"
            ? "+1 (555) 000-0000"
            : "Your answer";
      return (
        <Input
          id={id}
          type={inputType}
          required={field.required}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(shell, "h-12 text-base")}
          autoComplete={
            field.type === "email"
              ? "email"
              : field.type === "phone"
                ? "tel"
                : "name"
          }
        />
      );
    }
  }
});
