"use client";

import { memo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createFormAction } from "@/app/actions/forms";
import { cn } from "@/lib/utils";
import { formatFormsUsageLine } from "@/lib/monetization/plans";
import type { UsageSnapshot } from "@/lib/monetization/get-usage";
import { useUiStore } from "@/stores/ui-store";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Code2, Copy, ExternalLink, Loader2, Plus, BarChart3, Users } from "lucide-react";
import type { FormRow } from "@/types";
import { motion } from "framer-motion";
import { FormEmptyIllustration } from "@/components/empty-state/form-empty-illustration";
import { FormEmbedModal } from "@/components/forms/form-embed-modal";

type FormStatsMap = Record<
  string,
  { leads: number; conversionPct: number | null }
>;

const FormCard = memo(function FormCard({
  form,
  index,
  stats,
  onCopyLink,
  onEmbed,
}: {
  form: FormRow;
  index: number;
  stats?: { leads: number; conversionPct: number | null };
  onCopyLink: (id: string) => void;
  onEmbed: (form: FormRow) => void;
}) {
  const leads = stats?.leads ?? 0;
  const conv = stats?.conversionPct;

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="min-w-0 list-none"
    >
      <Card className="h-full border-slate-200/90 transition-shadow duration-300 hover:shadow-[0_16px_48px_-20px_rgba(15,23,42,0.15)]">
        <CardContent className="flex flex-col gap-5 pt-6">
          <div className="min-w-0 space-y-2">
            <h2
              className="line-clamp-2 break-words text-lg font-semibold text-slate-900"
              title={form.form_name}
            >
              {form.form_name}
            </h2>
            <p className="text-xs text-slate-500">
              Created{" "}
              {new Date(form.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50/90 p-3 ring-1 ring-slate-100">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                <Users className="size-3.5" aria-hidden />
                Leads
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{leads}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                <BarChart3 className="size-3.5" aria-hidden />
                Conversion
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                {conv != null ? `${conv}%` : "—"}
              </p>
            </div>
          </div>

          <div className="flex flex-row flex-wrap items-center gap-2">
            <Link
              href={`/forms/${form.id}`}
              className={cn(buttonVariants({ size: "sm" }), "min-w-0 shrink")}
            >
              <span className="truncate">Edit</span>
            </Link>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-w-0 shrink border-slate-200"
              onClick={() => onCopyLink(form.id)}
            >
              <Copy className="mr-1.5 size-3.5 shrink-0" />
              <span className="truncate">Copy link</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-w-0 shrink border-slate-200"
              onClick={() => onEmbed(form)}
            >
              <Code2 className="mr-1.5 size-3.5 shrink-0" />
              <span className="truncate">Embed</span>
            </Button>
            <Link
              href={`/f/${form.id}`}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "min-w-0 shrink"
              )}
            >
              <ExternalLink className="mr-1.5 size-3.5 shrink-0" />
              <span className="truncate">Open</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.li>
  );
});

export function FormsClient({
  initialForms,
  formStats,
  usage,
}: {
  initialForms: FormRow[];
  formStats: FormStatsMap;
  usage: UsageSnapshot;
}) {
  const router = useRouter();
  const openUpgradeModal = useUiStore((s) => s.openUpgradeModal);
  const [open, setOpen] = useState(false);
  const [embedTarget, setEmbedTarget] = useState<FormRow | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

  async function createForm(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current || loading) return;
    if (!name.trim()) return;

    submittingRef.current = true;
    setLoading(true);

    try {
      const result = await createFormAction(name.trim());
      if (!result.ok) {
        if (result.code === "FORM_LIMIT") {
          setOpen(false);
          openUpgradeModal("form_limit");
          toast.message("Form limit reached", {
            description: "Upgrade for more forms — see options in the dialog.",
          });
        } else {
          toast.error(result.error);
        }
        return;
      }

      toast.success("Form created");
      setOpen(false);
      setName("");
      router.push(`/forms/${result.formId}`);
      router.refresh();
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  function copyPublicLink(formId: string) {
    const url = `${window.location.origin}/f/${formId}`;
    void navigator.clipboard.writeText(url);
    toast.success("Public link copied");
  }

  return (
    <div className="space-y-8">
      <FormEmbedModal
        open={embedTarget !== null}
        onOpenChange={(next) => {
          if (!next) setEmbedTarget(null);
        }}
        formId={embedTarget?.id ?? ""}
        formName={embedTarget?.form_name ?? ""}
      />
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium text-primary">Forms</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Capture flows
          </h1>
          <p className="max-w-lg text-pretty text-sm text-slate-600 sm:text-base">
            Publish forms and track performance per link.
          </p>
        </div>
        {usage.atFormLimit ? (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              disabled
              title="You’ve used every form slot on your current plan. Upgrade to add more capture pages."
              className="shrink-0 border-slate-200 opacity-90"
            >
              <Plus className="mr-2 size-4 shrink-0" />
              New form
            </Button>
            <Button
              type="button"
              className="shadow-sm"
              onClick={() => openUpgradeModal("form_limit")}
            >
              Upgrade
            </Button>
          </div>
        ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            className={cn(
              buttonVariants(),
              "shrink-0 shadow-sm transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            )}
            disabled={loading}
          >
            <Plus className="mr-2 size-4 shrink-0" />
            New form
          </DialogTrigger>
          <DialogContent className="rounded-2xl border-slate-200 sm:max-w-md">
            <form onSubmit={createForm} aria-busy={loading}>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Create form</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 py-4">
                <Label htmlFor="form_name">Form name</Label>
                <Input
                  id="form_name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Website contact"
                  required
                  disabled={loading}
                  autoComplete="off"
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                <Button type="submit" className="min-w-[120px]" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 size-4 shrink-0 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    "Create"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {initialForms.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/90 bg-white px-6 py-16 text-center shadow-sm sm:py-20"
        >
          <FormEmptyIllustration className="mb-2 shrink-0" />
          <h2 className="mt-4 text-xl font-semibold text-slate-900">No forms yet</h2>
          <p className="mt-2 max-w-md text-pretty text-sm text-slate-600">
            Create a form to get a shareable link — submissions show up in Leads automatically.
          </p>
          <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center">
            {usage.atFormLimit ? (
              <>
                <p className="w-full text-sm text-slate-600">
                  {formatFormsUsageLine(usage.formCount, usage.maxForms)} — upgrade
                  to unlock more form slots.
                </p>
                <Button
                  type="button"
                  className="shadow-sm transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => openUpgradeModal("form_limit")}
                >
                  Upgrade for more forms
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="shadow-sm transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => setOpen(true)}
                  disabled={loading}
                >
                  <Plus className="mr-2 size-4 shrink-0" />
                  Create form
                </Button>
                <Link
                  href="/onboarding"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "border-slate-200 transition-transform duration-200 hover:scale-[1.01]"
                  )}
                >
                  Guided setup
                </Link>
              </>
            )}
          </div>
        </motion.div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {initialForms.map((f, i) => (
            <FormCard
              key={f.id}
              form={f}
              index={i}
              stats={formStats[f.id]}
              onCopyLink={copyPublicLink}
              onEmbed={setEmbedTarget}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
