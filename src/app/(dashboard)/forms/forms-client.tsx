"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { createFormAction, createFormFromTemplateAction } from "@/app/actions/forms";
import { cn } from "@/lib/utils";
import { formatFormsUsageLine } from "@/lib/monetization/plans";
import type { UsageSnapshot } from "@/lib/monetization/get-usage";
import { useUiStore } from "@/stores/ui-store";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Code2, Copy, ExternalLink, LayoutTemplate, Loader2, Plus, BarChart3, Users } from "lucide-react";
import type { FormRow } from "@/types";
import { motion } from "framer-motion";
import { FormEmptyIllustration } from "@/components/empty-state/form-empty-illustration";
import { FormEmbedModal } from "@/components/forms/form-embed-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FORM_TEMPLATES, type FormTemplateId } from "@/lib/form-templates";
import { DashboardHeaderActions } from "@/components/dashboard/dashboard-header-actions";

type FormStatsMap = Record<string, { leads: number; conversionPct: number | null }>;

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
  const [templateOpen, setTemplateOpen] = useState(false);
  const [embedTarget, setEmbedTarget] = useState<FormRow | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState<FormTemplateId | null>(null);
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

  const pickTemplate = useCallback(
    async (id: FormTemplateId) => {
      if (templateLoading) return;
      setTemplateLoading(id);
      try {
        const result = await createFormFromTemplateAction(id);
        if (!result.ok) {
          if (result.code === "FORM_LIMIT") {
            setTemplateOpen(false);
            openUpgradeModal("form_limit");
            toast.message("Form limit reached", { description: "Upgrade for more forms." });
          } else {
            toast.error(result.error);
          }
          return;
        }
        toast.success("Form created");
        setTemplateOpen(false);
        router.push(`/forms/${result.formId}`);
        router.refresh();
      } finally {
        setTemplateLoading(null);
      }
    },
    [openUpgradeModal, router, templateLoading]
  );

  function copyPublicLink(formId: string) {
    const url = `${window.location.origin}/f/${formId}`;
    void navigator.clipboard.writeText(url);
    toast.success("Public link copied");
  }

  const headerActions = useMemo(() => {
    if (usage.atFormLimit) {
      return (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled className="rounded-xl border-slate-200">
            <Plus className="mr-2 size-4 shrink-0" />
            New form
          </Button>
          <Button type="button" size="sm" className="rounded-xl" onClick={() => openUpgradeModal("form_limit")}>
            Upgrade
          </Button>
        </div>
      );
    }
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl border-slate-200 bg-white"
          onClick={() => setTemplateOpen(true)}
        >
          <LayoutTemplate className="mr-2 size-4 shrink-0" />
          Templates
        </Button>
        <Button type="button" size="sm" className="rounded-xl shadow-sm" disabled={loading} onClick={() => setOpen(true)}>
          <Plus className="mr-2 size-4 shrink-0" />
          New form
        </Button>
      </div>
    );
  }, [usage.atFormLimit, openUpgradeModal, loading]);

  return (
    <div className="space-y-8">
      <DashboardHeaderActions>{headerActions}</DashboardHeaderActions>

      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent className="max-w-lg rounded-2xl border-slate-200 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Start from a template</DialogTitle>
            <p className="text-sm text-slate-500">Fields are prefilled — edit anytime in the builder.</p>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            {FORM_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                disabled={templateLoading !== null}
                onClick={() => void pickTemplate(t.id)}
                className="flex w-full flex-col rounded-2xl border border-slate-200/90 bg-white p-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50/80 disabled:opacity-60"
              >
                <span className="font-semibold text-slate-900">{t.title}</span>
                <span className="mt-1 text-sm text-slate-600">{t.description}</span>
                {templateLoading === t.id ? (
                  <span className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Loader2 className="size-3.5 animate-spin" />
                    Creating…
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl border-slate-200 sm:max-w-md">
          <form onSubmit={createForm} aria-busy={loading}>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Blank form</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Label htmlFor="form_name">Name</Label>
              <Input
                id="form_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Website contact"
                required
                disabled={loading}
                autoComplete="off"
                className="rounded-xl"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="submit" className="min-w-[120px] rounded-xl" disabled={loading}>
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

      <FormEmbedModal
        open={embedTarget !== null}
        onOpenChange={(next) => {
          if (!next) setEmbedTarget(null);
        }}
        formId={embedTarget?.id ?? ""}
        formName={embedTarget?.form_name ?? ""}
      />

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-500">Library</p>
        <p className="max-w-xl text-pretty text-sm text-slate-600">
          {formatFormsUsageLine(usage.formCount, usage.maxForms)}. Click a row to edit.
        </p>
      </div>

      {initialForms.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/90 bg-white px-6 py-16 text-center sm:py-20"
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
                  {formatFormsUsageLine(usage.formCount, usage.maxForms)} — upgrade to unlock more form slots.
                </p>
                <Button
                  type="button"
                  className="rounded-xl shadow-sm transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => openUpgradeModal("form_limit")}
                >
                  Upgrade for more forms
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="rounded-xl shadow-sm transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => setOpen(true)}
                  disabled={loading}
                >
                  <Plus className="mr-2 size-4 shrink-0" />
                  Create form
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-slate-200"
                  onClick={() => setTemplateOpen(true)}
                >
                  <LayoutTemplate className="mr-2 size-4 shrink-0" />
                  Template
                </Button>
                <Link
                  href="/onboarding"
                  className={cn(buttonVariants({ variant: "outline" }), "rounded-xl border-slate-200")}
                >
                  Guided setup
                </Link>
              </>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white">
          <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 hover:bg-transparent">
                  <TableHead className="text-slate-500">Name</TableHead>
                  <TableHead className="text-right text-slate-500">Responses</TableHead>
                  <TableHead className="text-right text-slate-500">Conversion</TableHead>
                  <TableHead className="text-slate-500">Created</TableHead>
                  <TableHead className="text-right text-slate-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialForms.map((form) => {
                  const stats = formStats[form.id];
                  const leads = stats?.leads ?? 0;
                  const conv = stats?.conversionPct;
                  return (
                    <TableRow
                      key={form.id}
                      className="cursor-pointer border-slate-100 transition-colors hover:bg-slate-50/90"
                      onClick={() => router.push(`/forms/${form.id}`)}
                    >
                      <TableCell className="max-w-[220px] font-medium text-slate-900">
                        <span className="line-clamp-2 break-words">{form.form_name}</span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-slate-800">
                        <span className="inline-flex items-center justify-end gap-1">
                          <Users className="size-3.5 text-slate-400" aria-hidden />
                          {leads}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-slate-700">
                        <span className="inline-flex items-center justify-end gap-1">
                          <BarChart3 className="size-3.5 text-slate-400" aria-hidden />
                          {conv != null ? `${conv}%` : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {new Date(form.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-lg px-2 text-xs"
                            onClick={() => router.push(`/forms/${form.id}`)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-lg px-2 text-xs"
                            onClick={() => copyPublicLink(form.id)}
                          >
                            <Copy className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-lg px-2 text-xs"
                            onClick={() => setEmbedTarget(form)}
                          >
                            <Code2 className="size-3.5" />
                          </Button>
                          <Link
                            href={`/f/${form.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "sm" }),
                              "h-8 rounded-lg px-2 text-xs"
                            )}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="size-3.5" />
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
