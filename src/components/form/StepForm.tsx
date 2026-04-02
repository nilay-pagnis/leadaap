"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { EmbedBridgeEvent } from "@/lib/embed/post-message";
import {
  buildLeadFormDefaults,
  buildLeadFormSchema,
} from "@/lib/form/lead-form-schema";
import { cn } from "@/lib/utils";
import type { FieldRow } from "@/types";

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

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-base transition-all duration-200 outline-none md:focus:scale-[1.01] dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500";

const inputOk =
  "border-gray-300 text-gray-900 placeholder:text-gray-400 hover:border-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-600 dark:placeholder:text-zinc-500 dark:hover:border-zinc-500";

const inputErr =
  "border-red-500 text-red-500 placeholder:text-red-400/80 ring-1 ring-red-500/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 md:focus:scale-100 dark:border-red-500 dark:text-red-400";

function inputClassName(error?: string) {
  return cn(inputBase, error ? inputErr : inputOk);
}

function showFormError(message: string) {
  toast.custom(
    () => (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="pointer-events-auto w-full max-w-sm rounded-xl border border-red-200/90 bg-white px-4 py-3 text-sm font-medium text-red-700 shadow-lg"
      >
        {message}
      </motion.div>
    ),
    { duration: 3800 }
  );
}

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

export function StepFormLoading({
  variant = "page",
}: {
  variant?: "page" | "embed";
}) {
  const shell =
    variant === "embed"
      ? "relative w-full min-h-0 bg-gradient-to-br from-[#eef2ff] via-white to-[#f8fafc] px-3 py-4 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900"
      : "relative flex min-h-screen flex-col bg-gradient-to-br from-[#eef2ff] via-white to-[#f8fafc] dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900";
  const inner =
    variant === "embed"
      ? "relative mx-auto w-full max-w-lg"
      : "relative mx-auto flex w-full max-w-[900px] flex-1 flex-col justify-center px-4 py-8 md:px-6 md:py-12";
  const cardPad = variant === "embed" ? "p-4 sm:p-5" : "p-5 shadow-xl backdrop-blur-xl sm:p-8 md:p-12";
  return (
    <div className={shell}>
      {variant === "page" ? (
        <>
          <div className="pointer-events-none absolute -left-24 top-20 size-64 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-500/10" />
          <div className="pointer-events-none absolute -right-16 bottom-32 size-56 rounded-full bg-violet-200/25 blur-3xl dark:bg-violet-500/10" />
        </>
      ) : (
        <>
          <div className="pointer-events-none absolute -left-12 top-8 size-32 rounded-full bg-indigo-200/25 blur-2xl dark:bg-indigo-500/10" />
          <div className="pointer-events-none absolute -right-8 bottom-12 size-28 rounded-full bg-violet-200/20 blur-2xl dark:bg-violet-500/10" />
        </>
      )}
      <div className={inner}>
        <div
          className={cn(
            "rounded-2xl border border-gray-200 bg-white/80 dark:border-zinc-700 dark:bg-zinc-900/80",
            cardPad
          )}
        >
          <Skeleton className="h-5 w-48 rounded-lg" />
          <Skeleton className="mt-5 h-1 w-full rounded-full" />
          <Skeleton className="mt-5 h-10 w-full rounded-xl" />
          <Skeleton className="mt-4 h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function StepForm({
  formId,
  variant = "page",
  onEmbedEvent,
}: {
  formId: string;
  variant?: "page" | "embed";
  onEmbedEvent?: (event: EmbedBridgeEvent) => void;
}) {
  const [payload, setPayload] = useState<PublicPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);
  const submitLock = useRef(false);
  const isEmbed = variant === "embed";

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/public/forms/${formId}`, { cache: "no-store" });
        const json = (await res.json()) as PublicPayload & { error?: string };
        if (cancelled) return;
        if (!res.ok) {
          const msg = json.error ?? "Could not load form";
          setLoadError(msg);
          setLoading(false);
          if (isEmbed && onEmbedEvent) {
            onEmbedEvent({ kind: "error", message: msg });
            onEmbedEvent({
              kind: "analytics",
              name: "form_load_error",
              detail: { message: msg },
            });
          }
          return;
        }
        setPayload(json);
        setLoading(false);
        if (isEmbed && onEmbedEvent) {
          onEmbedEvent({ kind: "ready" });
          onEmbedEvent({
            kind: "analytics",
            name: "form_loaded",
            detail: { fieldCount: json.fields.length },
          });
        }
      } catch {
        if (!cancelled) {
          setLoadError("Network error");
          setLoading(false);
          if (isEmbed && onEmbedEvent) {
            onEmbedEvent({ kind: "error", message: "Network error" });
            onEmbedEvent({
              kind: "analytics",
              name: "form_load_error",
              detail: { message: "Network error" },
            });
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [formId, isEmbed, onEmbedEvent]);

  useEffect(() => {
    if (!isEmbed || !onEmbedEvent || !payload || payload.fields.length !== 0) return;
    onEmbedEvent({
      kind: "analytics",
      name: "form_empty_fields",
      detail: { formId: payload.form.id },
    });
  }, [isEmbed, onEmbedEvent, payload]);

  const orderedFields = useMemo(
    () => (payload ? sortFields(payload.fields) : []),
    [payload]
  );

  const schema = useMemo(
    () => buildLeadFormSchema(orderedFields),
    [orderedFields]
  );

  const {
    control,
    handleSubmit,
    getValues,
    watch,
    formState: { isValid, isSubmitting, errors },
    reset,
    trigger,
  } = useForm<Record<string, string | boolean>>({
    resolver: zodResolver(schema) as Resolver<Record<string, string | boolean>>,
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: {},
  });

  /** Same Zod rules as resolver — avoids RHF `isValid` / resolver desync (submit stuck disabled). */
  const watchedValues = watch();
  const canSubmit =
    orderedFields.length > 0 && schema.safeParse(watchedValues).success;

  useEffect(() => {
    if (!payload || orderedFields.length === 0) return;
    reset(buildLeadFormDefaults(orderedFields));
    // #region agent log
    queueMicrotask(() => {
      fetch("http://127.0.0.1:7681/ingest/39fd932c-adba-4dee-ae64-a07027ce3e53", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "0231de",
        },
        body: JSON.stringify({
          sessionId: "0231de",
          location: "StepForm.tsx:reset",
          message: "post-reset microtask",
          data: {
            hypothesisId: "H2",
            fieldCount: orderedFields.length,
            formId: payload.form.id,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    });
    // #endregion
  }, [payload, orderedFields, reset]);

  const steps = useMemo<StepGroup[]>(
    () =>
      generateSteps(orderedFields).map((group, i) => ({
        key: `step-${i + 1}`,
        fields: group,
      })),
    [orderedFields]
  );
  const showStepUi = steps.length > 1;
  const totalSteps = Math.max(steps.length, 1);
  const isLast = stepIndex >= steps.length - 1;
  const currentFields = useMemo(
    () => steps[stepIndex]?.fields ?? [],
    [steps, stepIndex]
  );
  const progress = (stepIndex + 1) / totalSteps;

  // #region agent log
  useEffect(() => {
    const errorKeys = Object.keys(errors);
    const valueKeys = Object.keys(getValues());
    fetch("http://127.0.0.1:7681/ingest/39fd932c-adba-4dee-ae64-a07027ce3e53", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "0231de",
      },
      body: JSON.stringify({
        sessionId: "0231de",
        location: "StepForm.tsx:formState",
        message: "isValid/errors snapshot",
        data: {
          hypothesisId: "H1",
          isValid,
          canSubmit,
          errorKeys,
          errorCount: errorKeys.length,
          valueKeyCount: valueKeys.length,
          stepIndex,
          isLast,
          runId: "post-fix",
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }, [isValid, canSubmit, errors, stepIndex, isLast, getValues]);
  // #endregion

  const goNext = useCallback(async () => {
    const ids = currentFields.map((f) => f.id);
    const ok = await trigger(ids as never);
    // #region agent log
    fetch("http://127.0.0.1:7681/ingest/39fd932c-adba-4dee-ae64-a07027ce3e53", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "0231de",
      },
      body: JSON.stringify({
        sessionId: "0231de",
        location: "StepForm.tsx:goNext",
        message: "trigger step fields",
        data: { hypothesisId: "H5", triggerOk: ok, fieldIds: ids, stepIndex },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    if (!ok) {
      if (isEmbed && onEmbedEvent) {
        onEmbedEvent({
          kind: "analytics",
          name: "validation_error",
          detail: { step: stepIndex },
        });
      }
      return;
    }
    setStepIndex((i) => Math.min(i + 1, Math.max(steps.length - 1, 0)));
  }, [currentFields, isEmbed, onEmbedEvent, steps.length, stepIndex, trigger]);

  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const onValidSubmit = useCallback(
    async (data: Record<string, string | boolean>) => {
      if (!payload || submitLock.current) return;
      submitLock.current = true;
      if (isEmbed && onEmbedEvent) {
        onEmbedEvent({ kind: "analytics", name: "submit_start" });
      }
      try {
        const res = await fetch("/api/public/submit-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ form_id: payload.form.id, data }),
        });
        const json = await res.json();
        if (!res.ok) {
          if (isEmbed && onEmbedEvent) {
            onEmbedEvent({
              kind: "analytics",
              name: "submit_error",
              detail: { code: json?.code, status: res.status },
            });
          }
          if (json?.code === "LEAD_LIMIT") {
            showFormError("You've reached your limit. Upgrade to continue.");
          } else {
            showFormError(json.error ?? "Submission failed");
          }
          return;
        }
        if (isEmbed && onEmbedEvent) {
          onEmbedEvent({ kind: "analytics", name: "submit_success" });
        }
        setDone(true);
      } catch {
        if (isEmbed && onEmbedEvent) {
          onEmbedEvent({
            kind: "analytics",
            name: "submit_error",
            detail: { reason: "network" },
          });
        }
        showFormError("Something went wrong");
      } finally {
        submitLock.current = false;
      }
    },
    [isEmbed, onEmbedEvent, payload]
  );

  function resetForAnother() {
    if (!payload) return;
    reset(buildLeadFormDefaults(sortFields(payload.fields)));
    setDone(false);
    setStepIndex(0);
    submitLock.current = false;
  }

  const brandLine = payload?.form.company_name?.trim()
    ? `${payload.form.company_name.trim()} × Enquireo`
    : "Form by Enquireo";

  if (loading) return <StepFormLoading variant={variant} />;

  if (loadError || !payload) {
    return (
      <div
        className={cn(
          "relative bg-gradient-to-br from-[#eef2ff] via-white to-[#f8fafc] px-4 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900",
          isEmbed ? "min-h-0 py-8" : "min-h-screen py-24"
        )}
      >
        <div className={cn("mx-auto text-center", isEmbed ? "max-w-lg" : "max-w-[900px]")}>
          <p className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
            Form unavailable
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">{loadError}</p>
        </div>
      </div>
    );
  }

  if (payload.fields.length === 0) {
    return (
      <div
        className={cn(
          "relative bg-gradient-to-br from-[#eef2ff] via-white to-[#f8fafc] px-4 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900",
          isEmbed ? "min-h-0 py-8" : "min-h-screen py-24"
        )}
      >
        <div className={cn("mx-auto text-center", isEmbed ? "max-w-lg" : "max-w-[900px]")}>
          <p className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
            No fields yet
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
            This form doesn&apos;t have any questions configured.
          </p>
        </div>
      </div>
    );
  }

  if (done) {
    if (isEmbed) {
      return (
        <div className="relative w-full min-h-0 bg-gradient-to-br from-[#eef2ff] via-white to-[#f8fafc] px-3 py-6 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mx-auto w-full max-w-lg rounded-2xl border border-gray-200 bg-white/95 p-6 text-center shadow-lg dark:border-zinc-700 dark:bg-zinc-900/95"
            role="status"
          >
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 className="size-8" strokeWidth={2} />
            </div>
            <h2 className="mt-4 text-lg font-semibold tracking-tight text-gray-900 dark:text-zinc-50">
              Your response has been submitted
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
              Thanks — we&apos;ll be in touch shortly.
            </p>
            <button
              type="button"
              onClick={resetForAnother}
              className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              <RotateCcw className="size-4" />
              Submit another response
            </button>
          </motion.div>
        </div>
      );
    }
    return (
      <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-[#eef2ff] via-white to-[#f8fafc] dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900">
        <div className="pointer-events-none absolute -left-24 top-20 size-64 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-500/10" />
        <div className="pointer-events-none absolute -right-16 bottom-32 size-56 rounded-full bg-violet-200/25 blur-3xl dark:bg-violet-500/10" />
        <AnimatePresence mode="wait">
          <motion.div
            key="success-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-[3px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-title"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-md rounded-3xl border border-gray-200 bg-white/95 p-8 text-center shadow-2xl backdrop-blur-xl md:p-10 dark:border-zinc-700 dark:bg-zinc-900/95"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 24, delay: 0.08 }}
                className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
              >
                <CheckCircle2 className="size-9" strokeWidth={2} />
              </motion.div>
              <h2
                id="success-title"
                className="mt-6 text-xl font-semibold tracking-tight text-gray-900 md:text-2xl dark:text-zinc-50"
              >
                Your response has been submitted
              </h2>
              <p className="mt-2 text-sm text-gray-600 md:text-base dark:text-zinc-400">
                Thanks — we&apos;ll be in touch shortly.
              </p>
              <button
                type="button"
                onClick={resetForAnother}
                className="mt-8 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              >
                <RotateCcw className="size-4" />
                Submit another response
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col bg-gradient-to-br from-[#eef2ff] via-white to-[#f8fafc] dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900",
        isEmbed ? "min-h-0 w-full" : "min-h-screen"
      )}
    >
      <div className="pointer-events-none absolute -left-24 top-20 size-64 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-500/10" />
      <div className="pointer-events-none absolute -right-16 top-1/3 size-56 rounded-full bg-violet-200/25 blur-3xl dark:bg-violet-500/10" />
      <div className="pointer-events-none absolute bottom-20 left-1/3 size-48 rounded-full bg-slate-200/40 blur-3xl dark:bg-slate-500/10" />

      <div
        className={cn(
          "relative mx-auto flex w-full flex-1 flex-col justify-center",
          isEmbed
            ? "max-w-lg px-3 py-4"
            : "max-w-[900px] px-4 py-8 md:px-6 md:py-12"
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={cn(
            "rounded-3xl border border-gray-200 bg-white/80 shadow-xl backdrop-blur-xl dark:border-zinc-700 dark:bg-zinc-900/80",
            isEmbed ? "p-4 sm:p-5" : "p-5 sm:p-8 md:p-12"
          )}
        >
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
              className="text-balance text-2xl font-bold tracking-tight text-gray-900 md:text-3xl md:tracking-tight dark:text-zinc-50"
              style={{ letterSpacing: "-0.02em" }}
            >
              {payload.form.form_name || "Form"}
            </motion.h1>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.12 }}
              className="shrink-0 text-sm text-gray-500 dark:text-zinc-400"
            >
              {brandLine}
            </motion.span>
          </div>

          {showStepUi ? (
            <div className="mb-6 h-1 overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-700">
              <div
                className="h-full bg-indigo-500 transition-all duration-500 ease-out"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          ) : null}

          {showStepUi ? (
            <p className="mb-6 text-sm text-gray-500 dark:text-zinc-400">
              Step {stepIndex + 1} of {totalSteps}
            </p>
          ) : null}

          <h2 className="mb-8 text-xl font-semibold tracking-tight text-gray-900 md:text-2xl dark:text-zinc-50">
            {currentFields.length === 1
              ? currentFields[0].label
              : "A few quick details"}
          </h2>

          <form
            onSubmit={handleSubmit(onValidSubmit)}
            className="flex flex-col"
            noValidate
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={stepIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-6"
              >
                {currentFields.map((field) => (
                  <Controller
                    key={field.id}
                    name={field.id}
                    control={control}
                    render={({ field: ctl, fieldState }) => (
                      <div className="space-y-2">
                        {field.type !== "checkbox" && currentFields.length > 1 ? (
                          <label
                            htmlFor={`field-${field.id}`}
                            className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
                          >
                            {field.label}
                            {field.required ? <span className="text-red-500"> *</span> : null}
                          </label>
                        ) : null}
                        <EnterpriseFieldInput
                          field={field}
                          value={ctl.value}
                          onChange={ctl.onChange}
                          onBlur={ctl.onBlur}
                          name={ctl.name}
                          inputRef={field.type === "checkbox" ? undefined : ctl.ref}
                          hideLabel={currentFields.length === 1}
                          error={fieldState.error?.message}
                        />
                      </div>
                    )}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {showStepUi && stepIndex > 0 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="cursor-pointer self-start text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-gray-900"
                >
                  Back
                </button>
              ) : (
                <span />
              )}

              <div className="flex flex-col items-stretch gap-3 sm:ml-auto sm:items-end">
                {!showStepUi || isLast ? (
                  <button
                    type="submit"
                    disabled={isSubmitting || !canSubmit}
                    className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-md transition-all duration-200 hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 sm:w-auto md:hover:scale-[1.02] md:disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                        Sending…
                      </>
                    ) : (
                      <>
                        Submit
                        <ArrowRight className="size-4" aria-hidden />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void goNext()}
                    className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-md transition-all duration-200 hover:bg-indigo-700 active:scale-[0.98] sm:w-auto md:hover:scale-[1.02]"
                  >
                    Continue
                    <ArrowRight className="size-4" aria-hidden />
                  </button>
                )}

                <p className="text-xs text-gray-400 dark:text-zinc-500">
                  {isEmbed
                    ? "Powered by Enquireo"
                    : "Your data is secure and never shared."}
                </p>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

const EnterpriseFieldInput = memo(function EnterpriseFieldInput({
  field,
  value,
  onChange,
  onBlur,
  name,
  inputRef,
  hideLabel,
  error,
}: {
  field: FieldRow;
  value: string | boolean | undefined;
  onChange: (v: string | boolean) => void;
  onBlur: () => void;
  name: string;
  inputRef?:
    | React.RefCallback<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    | null;
  hideLabel?: boolean;
  error?: string;
}) {
  const id = `field-${field.id}`;
  const opts = Array.isArray(field.options) ? field.options.map(String) : [];

  const errMsg = (
    <p
      className="mt-1.5 text-sm text-red-500 transition-opacity duration-200 dark:text-red-400"
      role="alert"
    >
      {error}
    </p>
  );

  switch (field.type) {
    case "checkbox":
      return (
        <div>
          <div
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-4 shadow-sm transition-all duration-200 hover:border-gray-400 dark:bg-zinc-900 dark:hover:border-zinc-500",
              error
                ? "border-red-500 ring-1 ring-red-500/20 dark:border-red-500"
                : "border-gray-300 dark:border-zinc-600"
            )}
          >
            <Checkbox
              id={id}
              name={name}
              checked={Boolean(value)}
              onCheckedChange={(c) => onChange(Boolean(c))}
              onBlur={onBlur}
              className="mt-0.5 border-gray-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:text-white"
            />
            <Label htmlFor={id} className="cursor-pointer text-sm font-medium text-gray-700 dark:text-zinc-300">
              {field.label}
              {field.required ? <span className="text-red-500"> *</span> : null}
            </Label>
          </div>
          {error ? errMsg : null}
        </div>
      );
    case "textarea":
      return (
        <div>
          {hideLabel ? (
            <label htmlFor={id} className="sr-only">
              {field.label}
            </label>
          ) : null}
          <textarea
            id={id}
            name={name}
            ref={inputRef as React.Ref<HTMLTextAreaElement>}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={hideLabel ? "Type your answer…" : undefined}
            rows={5}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className={cn(inputClassName(error), "min-h-[140px] resize-y")}
          />
          {error ? (
            <p id={`${id}-error`} className="mt-1.5 text-sm text-red-500 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      );
    case "select":
      if (opts.length === 0) {
        return (
          <div>
            {hideLabel ? (
              <label htmlFor={id} className="sr-only">
                {field.label}
              </label>
            ) : null}
            <select
              id={id}
              name={name}
              ref={inputRef as React.Ref<HTMLSelectElement>}
              value={String(value ?? "")}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              aria-invalid={error ? true : undefined}
              className={cn(
                inputClassName(error),
                "h-[50px] cursor-pointer appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
              )}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              }}
            >
              <option value="">
                {field.required ? "Select an option" : "Optional"}
              </option>
            </select>
            {error ? errMsg : null}
          </div>
        );
      }
      return (
        <div>
          {hideLabel ? (
            <label htmlFor={id} className="sr-only">
              {field.label}
              {field.required ? <span className="text-red-500"> *</span> : null}
            </label>
          ) : null}
          <select
            id={id}
            name={name}
            ref={inputRef as React.Ref<HTMLSelectElement>}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            aria-invalid={error ? true : undefined}
            className={cn(
              inputClassName(error),
              "h-[50px] cursor-pointer appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
            )}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
            }}
          >
            <option value="">
              {field.required ? "Select an option" : "Optional"}
            </option>
            {opts.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {error ? errMsg : null}
        </div>
      );
    default: {
      const inputType =
        field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text";
      const placeholderSingle =
        field.type === "email"
          ? "you@company.com"
          : field.type === "phone"
            ? "+1 (555) 000-0000"
            : field.label;
      const placeholderMulti =
        field.type === "email"
          ? "you@company.com"
          : field.type === "phone"
            ? "+1 (555) 000-0000"
            : "Your answer";
      return (
        <div>
          {hideLabel ? (
            <label htmlFor={id} className="sr-only">
              {field.label}
            </label>
          ) : null}
          <input
            id={id}
            name={name}
            ref={inputRef as React.Ref<HTMLInputElement>}
            type={inputType}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={hideLabel ? placeholderSingle : placeholderMulti}
            className={inputClassName(error)}
            autoComplete={
              field.type === "email" ? "email" : field.type === "phone" ? "tel" : undefined
            }
            aria-invalid={error ? true : undefined}
          />
          {error ? errMsg : null}
        </div>
      );
    }
  }
});
