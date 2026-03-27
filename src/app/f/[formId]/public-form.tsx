"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PublicFormOnboarding } from "./public-form-onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { FieldRow } from "@/types";

function validateFieldList(
  fields: FieldRow[],
  vals: Record<string, string | boolean>
): boolean {
  const sorted = [...fields].sort((a, b) => a.sort_order - b.sort_order);
  for (const f of sorted) {
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
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Loader2,
  Lock,
  RotateCcw,
  Shield,
  Sparkles,
} from "lucide-react";

type PublicPayload = {
  form: { id: string; form_name: string };
  fields: FieldRow[];
};

export function PublicFormLoading() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 sm:py-12">
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-6">
          <Skeleton className="size-11 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-3/4 max-w-xs" />
          </div>
        </div>
        <div className="mt-8 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function PublicForm({
  formId,
  pilotMode,
}: {
  formId: string;
  /** Website pilot funnel: /f/[id]?source=website&plan=trial */
  pilotMode?: { source: string; plan: string } | null;
}) {
  if (pilotMode) {
    return (
      <PublicFormOnboarding
        formId={formId}
        source={pilotMode.source}
        plan={pilotMode.plan}
      />
    );
  }

  return <PublicFormClassic formId={formId} />;
}

function PublicFormClassic({ formId }: { formId: string }) {
  const [payload, setPayload] = useState<PublicPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const submitLock = useRef(false);

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
          console.debug("[LeadAap public form]", {
            formId,
            fieldsCount: (json.fields as FieldRow[] | undefined)?.length,
            fields: json.fields,
          });
        }
        setPayload(json);
        const initial: Record<string, string | boolean> = {};
        for (const f of json.fields as FieldRow[]) {
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!payload || submitLock.current || submitting) return;
    const allFields = [...payload.fields].sort((a, b) => a.sort_order - b.sort_order);
    if (!validateFieldList(allFields, values)) return;
    submitLock.current = true;
    setSubmitting(true);
    const body = {
      form_id: payload.form.id,
      data: values,
    };
    try {
      const res = await fetch("/api/public/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(body),
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

  const sorted = useMemo(() => {
    if (!payload) return [] as FieldRow[];
    return [...payload.fields].sort((a, b) => a.sort_order - b.sort_order);
  }, [payload]);

  const steps = useMemo(() => {
    const size = 3;
    const out: FieldRow[][] = [];
    for (let i = 0; i < sorted.length; i += size) {
      out.push(sorted.slice(i, i + size));
    }
    return out.length ? out : [[]];
  }, [sorted]);

  const totalSteps = steps.length;
  const isLastStep = stepIndex >= totalSteps - 1;
  const currentFields = steps[stepIndex] ?? [];

  function goNext(e: React.MouseEvent) {
    e.preventDefault();
    if (!validateFieldList(currentFields, values)) return;
    setStepIndex((i) => Math.min(i + 1, totalSteps - 1));
  }

  function goBack() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  if (loading) {
    return <PublicFormLoading />;
  }

  if (loadError || !payload) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-lg font-semibold text-zinc-900">Form unavailable</p>
        <p className="mt-2 text-sm text-zinc-600">{loadError}</p>
      </div>
    );
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="mx-auto w-full max-w-xl px-4 py-8 sm:py-12"
      >
        <div className="rounded-2xl border border-emerald-200/70 bg-white p-10 text-center shadow-[0_20px_50px_-12px_rgba(16,185,129,0.2)]">
          <p className="text-4xl" aria-hidden>
            🎉
          </p>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900">
            Your request has been submitted
          </h1>
          <p className="mt-3 text-base text-zinc-600">
            We’ll contact you shortly.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-8 rounded-xl"
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
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto w-full max-w-xl px-4 py-8 sm:py-14"
    >
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_24px_48px_-12px_rgba(15,23,42,0.12)] sm:p-10">
        <header className="border-b border-slate-100 pb-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4F46E5] to-violet-600 text-white shadow-lg shadow-indigo-500/25">
            <Sparkles className="size-6" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            LeadAap
          </p>
          <h1 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {payload.form.form_name}
          </h1>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-slate-500">
            <Clock className="size-3.5 shrink-0" />
            Takes less than a minute
          </p>
          {totalSteps > 1 && (
            <div className="mx-auto mt-6 flex max-w-xs items-center justify-center gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    i <= stepIndex ? "bg-primary" : "bg-slate-200"
                  )}
                />
              ))}
            </div>
          )}
          {totalSteps > 1 && (
            <p className="mt-3 text-xs font-medium text-slate-500">
              Step {stepIndex + 1} of {totalSteps}
            </p>
          )}
        </header>

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22 }}
              className="space-y-6"
            >
              {currentFields.map((field) => (
                <FieldInput
                  key={field.id}
                  field={field}
                  value={values[field.id]}
                  onChange={(v) =>
                    setValues((prev) => ({ ...prev, [field.id]: v }))
                  }
                />
              ))}
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-slate-100 pt-6 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="size-3.5 text-emerald-600" aria-hidden />
              Secure submission
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="size-3.5 text-primary" aria-hidden />
              Private by design
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-slate-400" aria-hidden />
              No spam
            </span>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
            <Lock className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
            <span>We only use your details to respond to this request.</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            {stepIndex > 0 && (
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-xl border-slate-200 sm:w-auto"
                onClick={goBack}
              >
                <ChevronLeft className="mr-2 size-4" />
                Back
              </Button>
            )}
            {!isLastStep ? (
              <Button
                type="button"
                className="h-14 flex-1 rounded-xl text-base font-semibold shadow-lg shadow-indigo-500/15"
                onClick={goNext}
                disabled={submitting || currentFields.length === 0}
              >
                Continue
                <ArrowRight className="ml-2 size-5" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="h-14 flex-1 rounded-xl text-base font-semibold shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                disabled={submitting || sorted.length === 0}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Submit request
                    <ArrowRight className="ml-2 size-5" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
}

const FieldInput = memo(function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldRow;
  value: string | boolean | undefined;
  onChange: (v: string | boolean) => void;
}) {
  const id = `f-${field.id}`;
  const opts = Array.isArray(field.options)
    ? field.options.map(String)
    : [];

  const labelCls =
    "text-sm font-medium text-zinc-800";
  const controlCls =
    "h-12 rounded-xl border-zinc-200 bg-white text-base transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500/30";

  switch (field.type) {
    case "checkbox":
      return (
        <div className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 transition-colors hover:bg-zinc-50">
          <Checkbox
            id={id}
            checked={Boolean(value)}
            onCheckedChange={(c) => onChange(Boolean(c))}
            className="mt-0.5"
          />
          <Label
            htmlFor={id}
            className={cn(labelCls, "cursor-pointer leading-snug")}
          >
            {field.label}
            {field.required && <span className="text-red-500"> *</span>}
          </Label>
        </div>
      );
    case "textarea":
      return (
        <div className="space-y-2">
          <Label htmlFor={id} className={labelCls}>
            {field.label}
            {field.required && <span className="text-red-500"> *</span>}
          </Label>
          <Textarea
            id={id}
            required={field.required}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your message…"
            className="min-h-[120px] rounded-xl border-zinc-200 text-base"
          />
        </div>
      );
    case "select":
      return (
        <div className="space-y-2">
          <Label htmlFor={id} className={labelCls}>
            {field.label}
            {field.required && <span className="text-red-500"> *</span>}
          </Label>
          <select
            id={id}
            required={field.required}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              controlCls,
              "h-12 w-full cursor-pointer px-3 text-base text-zinc-900"
            )}
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
          ? "name@company.com"
          : field.type === "phone"
            ? "+1 (555) 000-0000"
            : "Your answer";
      return (
        <div className="space-y-2">
          <Label htmlFor={id} className={labelCls}>
            {field.label}
            {field.required && <span className="text-red-500"> *</span>}
          </Label>
          <Input
            id={id}
            type={inputType}
            required={field.required}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={controlCls}
            autoComplete={
              field.type === "email"
                ? "email"
                : field.type === "phone"
                  ? "tel"
                  : "name"
            }
          />
        </div>
      );
    }
  }
});
