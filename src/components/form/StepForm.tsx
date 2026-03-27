"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Sparkles,
  Target,
  Zap,
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

type PublicPayload = {
  form: {
    id: string;
    form_name: string;
    company_name?: string | null;
  };
  fields: FieldRow[];
};

type StepGroup = {
  key: string;
  fields: FieldRow[];
};

function sortFields(fields: FieldRow[]) {
  return [...fields].sort((a, b) => a.sort_order - b.sort_order);
}

function generateSteps(fields: FieldRow[]): FieldRow[][] {
  if (fields.length <= 5) return [fields];
  const chunkSize = 2;
  const steps: FieldRow[][] = [];
  for (let i = 0; i < fields.length; i += chunkSize) {
    steps.push(fields.slice(i, i + chunkSize));
  }
  return steps;
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

function validateStep(
  fields: FieldRow[],
  vals: Record<string, string | boolean>
): string | null {
  for (const field of fields) {
    if (!field.required) continue;
    const value = vals[field.id];
    if (field.type === "checkbox") {
      if (!value) return `Please confirm: ${field.label}`;
      continue;
    }
    if (value === undefined || value === null || String(value).trim() === "") {
      return `Please fill: ${field.label}`;
    }
  }
  return null;
}

export function StepFormLoading() {
  return (
    <div className="mx-auto grid min-h-screen w-full max-w-[1400px] grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-10 lg:px-8">
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-sm backdrop-blur">
        <Skeleton className="h-10 w-72 rounded-xl" />
        <Skeleton className="mt-4 h-5 w-full max-w-md" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl lg:min-h-[760px]">
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="mx-auto mt-8 h-10 w-80 rounded-xl" />
        <Skeleton className="mx-auto mt-2 h-4 w-56 rounded-lg" />
        <div className="mt-8 space-y-5">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
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
        const res = await fetch(`/api/public/forms/${formId}`, { cache: "no-store" });
        const json = (await res.json()) as PublicPayload & { error?: string };
        if (cancelled) return;
        if (!res.ok) {
          setLoadError(json.error ?? "Could not load form");
          setLoading(false);
          return;
        }
        setPayload(json);
        const initial: Record<string, string | boolean> = {};
        for (const f of json.fields) initial[f.id] = f.type === "checkbox" ? false : "";
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

  const orderedFields = useMemo(
    () => (payload ? sortFields(payload.fields) : []),
    [payload]
  );
  const steps = useMemo<StepGroup[]>(
    () => generateSteps(orderedFields).map((group, i) => ({ key: `step-${i + 1}`, fields: group })),
    [orderedFields]
  );
  const showStepUi = steps.length > 1;
  const totalSteps = Math.max(steps.length, 1);
  const isLast = stepIndex >= steps.length - 1;
  const currentStep = steps[stepIndex];
  const currentFields = currentStep?.fields ?? [];
  const progressPct = Math.round(((stepIndex + 1) / totalSteps) * 100);

  const goNext = useCallback(() => {
    const error = validateStep(currentFields, values);
    if (error) {
      toast.error(error);
      return;
    }
    setStepIndex((i) => Math.min(i + 1, Math.max(steps.length - 1, 0)));
  }, [currentFields, steps.length, values]);

  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

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
        body: JSON.stringify({ form_id: payload.form.id, data: values }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json?.code === "LEAD_LIMIT") {
          toast.error("You've reached your limit. Upgrade to continue.");
        } else {
          toast.error(json.error ?? "Submission failed");
        }
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
    for (const f of payload.fields) initial[f.id] = f.type === "checkbox" ? false : "";
    setValues(initial);
    setDone(false);
    setStepIndex(0);
    submitLock.current = false;
  }

  if (loading) return <StepFormLoading />;

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
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto max-w-2xl px-4 py-14"
      >
        <div className="rounded-3xl border border-emerald-200/80 bg-white p-10 text-center shadow-[0_24px_64px_-24px_rgba(16,185,129,0.25)] sm:p-12">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="size-9" />
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
            Your request has been submitted
          </h2>
          <p className="mt-3 text-slate-600">Thanks — we&apos;ll be in touch shortly.</p>
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
    );
  }

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-[1400px] grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-10 lg:px-8">
      <motion.section
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        className="order-2 rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_24px_64px_-28px_rgba(79,70,229,0.25)] backdrop-blur-sm lg:order-1 lg:p-8"
      >
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Build something great together
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
          We help businesses capture and convert high-quality leads.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <FeatureCard
            title="Smart Lead Capture"
            text="Structured forms that qualify intent from the first interaction."
            icon={<Sparkles className="size-4" />}
          />
          <FeatureCard
            title="Faster Response"
            text="Prioritized submissions make follow-ups faster and more relevant."
            icon={<Zap className="size-4" />}
          />
          <FeatureCard
            title="Better Conversion"
            text="Cleaner pipeline handoff improves close-rate consistency."
            icon={<Target className="size-4" />}
            wide
          />
        </div>

        <div className="mt-8 h-28 rounded-2xl bg-gradient-to-r from-indigo-500/15 via-violet-500/15 to-sky-500/15 ring-1 ring-white/60" />
      </motion.section>

      <motion.section
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        className="order-1 flex h-full min-h-[640px] flex-col rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_24px_64px_-28px_rgba(15,23,42,0.18)] lg:order-2 lg:min-h-[760px] lg:p-10 sm:p-8"
      >
        {showStepUi ? (
          <>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-violet-500"
                animate={{ width: `${progressPct}%` }}
                initial={false}
                transition={{ type: "spring", stiffness: 140, damping: 24 }}
              />
            </div>
            <p className="mt-2 text-right text-xs font-semibold text-slate-500">{progressPct}%</p>
          </>
        ) : null}

        <div className="mt-6">
          <FormHeader companyName={payload.form.company_name} />
        </div>

        {showStepUi ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {steps.map((step, i) => (
              <span
                key={`${step.key}-${i}`}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  i === stepIndex
                    ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                {i + 1}
              </span>
            ))}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 flex flex-1 flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.22 }}
              className="space-y-5"
            >
              {currentFields.map((field, fieldInStepIndex) => (
                <div key={field.id} className="space-y-2">
                  {showStepUi ? (
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Question {stepIndex * 2 + fieldInStepIndex + 1} of {orderedFields.length}
                    </p>
                  ) : null}
                  {field.type !== "checkbox" && (
                    <Label className="text-sm font-semibold text-slate-700">
                      {field.label}
                      {field.required ? <span className="text-red-500"> *</span> : null}
                    </Label>
                  )}
                  <PremiumFieldInput
                    field={field}
                    value={values[field.id]}
                    onChange={(v) => setValues((prev) => ({ ...prev, [field.id]: v }))}
                  />
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          {showStepUi ? (
            <div className="mt-8 flex items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                disabled={stepIndex === 0}
                className="rounded-xl text-slate-600"
                onClick={goBack}
              >
                Back
              </Button>

              {!isLast ? (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="button"
                    className="h-12 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#6366F1] px-7 text-sm font-semibold shadow-md shadow-indigo-500/20"
                    onClick={goNext}
                  >
                    Continue
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-12 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#6366F1] px-7 text-sm font-semibold shadow-md shadow-indigo-500/20"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        Submit request
                        <ArrowRight className="ml-2 size-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="mt-8 flex justify-end pt-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-12 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#6366F1] px-7 text-sm font-semibold shadow-md shadow-indigo-500/20"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Submit request
                      <ArrowRight className="ml-2 size-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          )}

          <div className="mt-auto flex flex-col items-center justify-center gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:gap-10">
            <span className="inline-flex items-center gap-2 text-sm text-slate-600">
              <Check className="size-4 shrink-0 text-primary" aria-hidden />
              Your data is secure
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-slate-600">
              <Check className="size-4 shrink-0 text-primary" aria-hidden />
              We respond within 24 hours
            </span>
          </div>
        </form>
      </motion.section>
    </div>
  );
}

function FeatureCard({
  title,
  text,
  icon,
  wide = false,
}: {
  title: string;
  text: string;
  icon: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/80 bg-white/85 p-4 shadow-sm backdrop-blur",
        wide && "sm:col-span-2"
      )}
    >
      <div className="inline-flex rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
      <p className="mt-2 text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}

const PremiumFieldInput = memo(function PremiumFieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldRow;
  value: string | boolean | undefined;
  onChange: (v: string | boolean) => void;
}) {
  const id = `premium-${field.id}`;
  const opts = Array.isArray(field.options) ? field.options.map(String) : [];

  const shell =
    "rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#4F46E5]/25";

  switch (field.type) {
    case "checkbox":
      return (
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <Checkbox
            id={id}
            checked={Boolean(value)}
            onCheckedChange={(c) => onChange(Boolean(c))}
            className="mt-1 data-[state=checked]:bg-[#4F46E5]"
          />
          <Label htmlFor={id} className="cursor-pointer text-sm leading-relaxed text-slate-700">
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
          placeholder="Describe your requirement..."
          className={cn(shell, "min-h-[130px] resize-y")}
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
            className={cn(shell, "h-12 w-full cursor-pointer")}
          >
            <option value="">
              {field.required ? "Select an option..." : "Optional"}
            </option>
          </select>
        );
      }
      return (
        <select
          id={id}
          required={field.required}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className={cn(shell, "h-12 w-full cursor-pointer")}
        >
          <option value="">
            {field.required ? "Select an option..." : "Optional"}
          </option>
          {opts.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    default: {
      const inputType =
        field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text";
      const placeholder =
        field.type === "email"
          ? "name@company.com"
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
          className={cn(shell, "h-12")}
        />
      );
    }
  }
});
