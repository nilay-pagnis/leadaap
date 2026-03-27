"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";
import { createOnboardingFormAction } from "@/app/actions/forms";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  Copy,
  Sparkles,
  PartyPopper,
  LayoutTemplate,
} from "lucide-react";
import { ONBOARDING_DEFAULT_FORM_NAME } from "@/lib/onboarding-defaults";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Welcome" },
  { id: 2, label: "Your form" },
  { id: 3, label: "You’re live" },
];

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formName, setFormName] = useState(ONBOARDING_DEFAULT_FORM_NAME);
  const [loading, setLoading] = useState(false);
  const [createdFormId, setCreatedFormId] = useState<string | null>(null);

  async function createForm() {
    setLoading(true);
    const name = formName.trim() || ONBOARDING_DEFAULT_FORM_NAME;

    const result = await createOnboardingFormAction(name);
    setLoading(false);

    if (!result.ok) {
      if (result.code === "UNAUTHORIZED") {
        toast.error("Please sign in again.");
        router.push("/login?next=/onboarding");
        return;
      }
      if (result.code === "FORM_LIMIT") {
        toast.error(result.error, {
          description: "Upgrade your plan when you’re ready — we’ll keep your spot here.",
          action: {
            label: "View plans",
            onClick: () => router.push("/dashboard/billing"),
          },
        });
        return;
      }
      toast.error(result.error);
      return;
    }

    setCreatedFormId(result.formId);
    setStep(3);
    toast.success("Your form is ready");
  }

  function copyLink() {
    if (!createdFormId) return;
    const url = `${window.location.origin}/f/${createdFormId}`;
    void navigator.clipboard.writeText(url);
    toast.success("Link copied");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-6 py-12 sm:py-20">
      <div className="mb-10 flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={cn(
                  "h-0.5 w-10 rounded-full sm:w-14",
                  step > s.id - 1 ? "bg-indigo-400" : "bg-zinc-200"
                )}
              />
            )}
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                step >= s.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : "bg-zinc-200/80 text-zinc-500"
              )}
            >
              {step > s.id ? <Check className="size-4" /> : s.id}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="s1"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="flex flex-1 flex-col text-center"
          >
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/25">
              <Sparkles className="size-8" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              Let’s create your first form
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-zinc-600">
              In the next step we’ll add a proven layout: name, email, and a message
              field — so you can go live in under a minute.
            </p>
            <div className="mt-10 space-y-3 rounded-2xl border border-zinc-200/80 bg-white/80 p-5 text-left shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                What you get
              </p>
              <ul className="space-y-3 text-sm text-zinc-700">
                <li className="flex gap-3">
                  <LayoutTemplate className="mt-0.5 size-4 shrink-0 text-indigo-600" />
                  <span>Three smart fields, ready to customize later</span>
                </li>
                <li className="flex gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-indigo-600" />
                  <span>A shareable link you can post anywhere</span>
                </li>
              </ul>
            </div>
            <Button
              type="button"
              size="lg"
              className="mt-auto w-full rounded-2xl py-6 text-base shadow-lg shadow-indigo-500/20"
              onClick={() => setStep(2)}
            >
              Continue
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="s2"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="flex flex-1 flex-col"
          >
            <h1 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              Name your form
            </h1>
            <p className="mt-3 text-center text-zinc-600">
              We’ll add name, email, and message fields automatically.
            </p>
            <div className="mt-10 space-y-2">
              <Label htmlFor="onb-name" className="text-zinc-700">
                Form name
              </Label>
              <Input
                id="onb-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Contact"
                className="h-12 rounded-2xl border-zinc-200 bg-white text-base"
              />
            </div>
            <div className="mt-6 rounded-2xl border border-dashed border-indigo-200/80 bg-indigo-50/50 p-4 text-sm text-zinc-600">
              <p className="font-medium text-zinc-800">Included fields</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-zinc-600">
                <li>Full name (required)</li>
                <li>Work email (required)</li>
                <li>How can we help? (optional)</li>
              </ul>
            </div>
            <div className="mt-auto flex flex-col gap-3 pt-10 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                className="rounded-2xl"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="button"
                size="lg"
                className="rounded-2xl px-8 shadow-lg shadow-indigo-500/20"
                disabled={loading}
                onClick={() => void createForm()}
              >
                {loading ? "Creating…" : "Create my form"}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && createdFormId && (
          <motion.div
            key="s3"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-1 flex-col text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
            >
              <PartyPopper className="size-10" />
            </motion.div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Your form is live
            </h1>
            <p className="mt-3 text-lg text-zinc-600">
              Share this link anywhere — your first lead could arrive in minutes.
            </p>
            <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Public link
              </p>
              <p className="mt-2 break-all font-mono text-sm text-indigo-700">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/f/${createdFormId}`
                  : `/f/${createdFormId}`}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 w-full rounded-xl"
                onClick={copyLink}
              >
                <Copy className="mr-2 size-4" />
                Copy link
              </Button>
            </div>
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-8 inline-flex w-full items-center justify-center rounded-2xl py-6 text-base shadow-lg shadow-indigo-500/20"
              )}
            >
              Go to dashboard
            </Link>
            <Link
              href={`/forms/${createdFormId}`}
              className="mt-4 text-sm font-medium text-indigo-600 underline-offset-4 hover:underline"
            >
              Customize fields in the builder
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
