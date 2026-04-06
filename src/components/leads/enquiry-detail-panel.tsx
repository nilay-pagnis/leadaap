"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bell,
  Check,
  FileText,
  Link2,
  Loader2,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Sparkles,
  StickyNote,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FormDetailsDialog } from "@/components/leads/form-details-dialog";
import { LeadDetailDrawer } from "@/components/leads/lead-detail-drawer";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { ActivityFeed } from "@/components/leads/activity-timeline";
import { EnquiryFormSourceLine } from "@/components/leads/enquiry-form-source-line";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ClientLocalDateTime } from "@/components/ui/client-local-datetime";
import { ClientRelativeTime } from "@/components/ui/client-relative-time";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useLeadActivities } from "@/hooks/use-lead-activities";
import { dayjs } from "@/lib/dayjs-config";
import { getLeadNameAndEmail } from "@/lib/leads/lead-display";
import { buildWhatsAppUrl } from "@/lib/leads/whatsapp-url";
import {
  getLeadMessageSnippet,
  WHATSAPP_TEMPLATES,
} from "@/lib/leads/whatsapp-templates";
import { calculateLeadScore, type LeadScoreResult } from "@/lib/leads/lead-score";
import { ScoreBadge } from "@/components/leads/score-badge";
import { getNoteBody, isNotePayload } from "@/lib/leads/activity-messages";
import type { FollowUpRow } from "@/types/follow-ups";
import type { LeadActivity, LeadFieldDef, LeadRow, LeadStatus } from "@/types";
import { parseTimestamptz } from "@/lib/timestamptz";
import { toast } from "sonner";

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "closed"];

const sectionTitle =
  "text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500";

function DetailSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={sectionTitle}>{title}</p>
        {action}
      </div>
      {children}
    </section>
  );
}

function formatLeadValue(v: string | boolean | string[] | undefined): string {
  if (v === undefined || v === null) return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return v.join(", ");
  const s = String(v).trim();
  return s || "—";
}

function getLeadPhone(lead: LeadRow, fieldDefs: LeadFieldDef[]): string {
  if (lead.form_id == null || lead.form_id === "") {
    const v = lead.data?.phone;
    return typeof v === "string" && v.trim() ? v.trim() : "—";
  }
  const defs = fieldDefs.filter(
    (f) => f.form_id === lead.form_id && f.type === "phone"
  );
  for (const f of defs) {
    const v = lead.data?.[f.id];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "—";
}

function getInitials(name: string, email: string): string {
  const n = name.trim();
  if (n && n !== "—") {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const a = parts[0][0];
      const b = parts[parts.length - 1][0];
      if (a && b) return (a + b).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  }
  const e = email.trim();
  if (e && e !== "—") return e.slice(0, 2).toUpperCase();
  return "?";
}

function statusLabel(s: LeadStatus): string {
  switch (s) {
    case "new":
      return "New";
    case "contacted":
      return "Contacted";
    case "qualified":
      return "Qualified";
    case "closed":
      return "Closed";
    default:
      return s;
  }
}

function DetailCell({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/70 bg-white p-4",
        "shadow-sm ring-1 ring-slate-900/[0.02] transition-all duration-200",
        "hover:border-slate-200 hover:shadow-md hover:ring-slate-900/[0.04]"
      )}
    >
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <div className="mt-1.5 break-words text-sm font-semibold leading-snug text-slate-900">
        {value}
      </div>
    </div>
  );
}

async function copyToClipboard(text: string, message: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(message);
  } catch {
    toast.error("Could not copy to clipboard");
  }
}

export type EnquiryDetailPanelProps = {
  open: boolean;
  onClose: () => void;
  lead: LeadRow | null;
  formNames: Record<string, string>;
  fieldDefs: LeadFieldDef[];
  activityRefreshKey: number;
  /** From parent `useRelativeTimeTicker(true)` for client-local relative timestamps. */
  timeTick: number;
  variant?: "overlay" | "embedded";
  onStatusChange?: (id: string, status: LeadStatus) => void;
  updatingLeadId?: string | null;
  /** Paid plans: numeric score, breakdown dialog, full insight copy. */
  paidInboxFeatures?: boolean;
};

export function EnquiryDetailPanel({
  open,
  onClose,
  lead,
  formNames,
  fieldDefs,
  activityRefreshKey,
  timeTick,
  variant = "overlay",
  onStatusChange,
  updatingLeadId,
  paidInboxFeatures = true,
}: EnquiryDetailPanelProps) {
  const notesSectionRef = useRef<HTMLDivElement>(null);
  const [formDetailsOpen, setFormDetailsOpen] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const { activityItems, noteItems, loading, reload } = useLeadActivities(
    lead?.id ?? null,
    lead?.created_at ?? "",
    activityRefreshKey
  );

  const [noteDraft, setNoteDraft] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const [nextFollowUp, setNextFollowUp] = useState<FollowUpRow | null>(null);
  const [followUpRefreshKey, setFollowUpRefreshKey] = useState(0);
  const [customReminderOpen, setCustomReminderOpen] = useState(false);
  const [customReminderLocal, setCustomReminderLocal] = useState("");
  const [followUpSaving, setFollowUpSaving] = useState(false);

  const defsForForm = useMemo(() => {
    if (!lead?.form_id) return [];
    return fieldDefs
      .filter((f) => f.form_id === lead.form_id)
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [fieldDefs, lead?.form_id]);

  const textareas = useMemo(
    () => defsForForm.filter((f) => f.type === "textarea"),
    [defsForForm]
  );

  const quickFieldRows = useMemo(() => {
    if (!lead) return [];
    const data = lead.data ?? {};
    if (lead.form_id == null || lead.form_id === "") {
      const rows: { key: string; label: string; value: string }[] = [];
      const order: [string, string][] = [
        ["name", "Name"],
        ["email", "Email"],
        ["phone", "Phone"],
        ["source", "Source"],
      ];
      for (const [key, label] of order) {
        if (!(key in data)) continue;
        rows.push({ key, label, value: formatLeadValue(data[key]) });
      }
      return rows;
    }
    const rows: { key: string; label: string; value: string }[] = [];
    for (const f of defsForForm) {
      if (f.type === "textarea") continue;
      if (!(f.id in data)) continue;
      rows.push({
        key: f.id,
        label: f.label,
        value: formatLeadValue(data[f.id]),
      });
    }
    return rows;
  }, [lead, defsForForm]);

  const { name, email } = lead
    ? getLeadNameAndEmail(lead, fieldDefs)
    : { name: "—", email: "—" };
  const phone = lead ? getLeadPhone(lead, fieldDefs) : "—";
  const initials = lead ? getInitials(name, email) : "?";

  const formName = lead
    ? lead.form_id
      ? (formNames[lead.form_id] ?? lead.form_id)
      : "Manual Entry"
    : "—";

  const scoreResult: LeadScoreResult = useMemo(
    () =>
      lead
        ? calculateLeadScore({ lead, formNames, fieldDefs })
        : {
            score: 0,
            label: "Cold",
            lines: [],
            explanation:
              "Fewer urgency signals from this submission. Qualify further or add to nurture.",
          },
    [lead, formNames, fieldDefs]
  );

  const detailRows = useMemo(() => {
    if (!lead) return [];
    return [
      {
        key: "form",
        label: "Form",
        value: (
          <EnquiryFormSourceLine
            lead={lead}
            formNames={formNames}
            titleClassName="break-words leading-snug"
          />
        ),
      },
      {
        key: "submitted",
        label: "Submitted",
        value: (
          <ClientLocalDateTime
            iso={lead.created_at}
            className="font-semibold text-slate-900"
          />
        ),
      },
      ...quickFieldRows.map((r) => ({ key: r.key, label: r.label, value: r.value })),
    ];
  }, [lead, formNames, quickFieldRows]);

  const scrollToNotes = useCallback(() => {
    notesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      document.getElementById("enquiry-note-draft")?.focus();
    }, 280);
  }, []);

  const enquiryUrl =
    lead && origin ? `${origin}/inbox?lead=${lead.id}` : "";

  useEffect(() => {
    if (!open || !lead) {
      setNextFollowUp(null);
      return;
    }
    const leadId = lead.id;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("follow_ups")
        .select("*")
        .eq("lead_id", leadId)
        .eq("status", "pending")
        .order("remind_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setNextFollowUp(null);
        return;
      }
      setNextFollowUp(data as FollowUpRow | null);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by lead id only; full `lead` updates from parent are frequent
  }, [open, lead?.id, followUpRefreshKey]);

  const bumpFollowUpRefresh = useCallback(() => {
    setFollowUpRefreshKey((k) => k + 1);
  }, []);

  const scheduleReminderAt = useCallback(
    async (remindAtIso: string) => {
      if (!lead) return;
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Sign in required");
        return;
      }
      setFollowUpSaving(true);
      const { error } = await supabase.from("follow_ups").insert({
        user_id: user.id,
        lead_id: lead.id,
        remind_at: remindAtIso,
        status: "pending",
      });
      setFollowUpSaving(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Reminder scheduled");
      bumpFollowUpRefresh();
    },
    [lead, bumpFollowUpRefresh]
  );

  const setFollowUpStatus = useCallback(
    async (id: string, status: "dismissed" | "completed") => {
      if (!lead) return;
      const supabase = createClient();
      setFollowUpSaving(true);
      const { error } = await supabase
        .from("follow_ups")
        .update({ status })
        .eq("id", id)
        .eq("lead_id", lead.id);
      setFollowUpSaving(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(status === "completed" ? "Marked done" : "Reminder dismissed");
      bumpFollowUpRefresh();
    },
    [lead, bumpFollowUpRefresh]
  );

  const waCtx = useMemo(
    () => ({
      contactName: name,
      formName,
      messageSnippet: lead ? getLeadMessageSnippet(lead, fieldDefs) : "",
    }),
    [name, formName, lead, fieldDefs]
  );

  const openWhatsApp = useCallback(
    (templateId?: string) => {
      if (!lead || phone === "—") return;
      const tpl = templateId
        ? WHATSAPP_TEMPLATES.find((t) => t.id === templateId)
        : WHATSAPP_TEMPLATES[0];
      const text = tpl
        ? tpl.build(waCtx)
        : WHATSAPP_TEMPLATES[0].build(waCtx);
      const url = buildWhatsAppUrl(phone, text);
      if (!url) return;
      window.open(url, "_blank", "noopener,noreferrer");
    },
    [lead, phone, waCtx]
  );

  const followUpDue = useMemo(() => {
    if (nextFollowUp == null) return false;
    void timeTick;
    return parseTimestamptz(nextFollowUp.remind_at).getTime() <= Date.now();
  }, [nextFollowUp, timeTick]);

  const addNote = useCallback(async () => {
    if (!lead) return;
    const body = noteDraft.trim();
    if (!body || noteSubmitting) return;
    setNoteSubmitting(true);
    const supabase = createClient();
    const createdAt = new Date().toISOString();
    const { error } = await supabase.from("lead_activities").insert({
      lead_id: lead.id,
      type: "note",
      payload: { body },
      created_at: createdAt,
    });
    setNoteSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setNoteDraft("");
    toast.success("Note added");
    await reload();
  }, [lead, noteDraft, noteSubmitting, reload]);

  const startEdit = useCallback((a: LeadActivity) => {
    if (!isNotePayload(a.payload)) return;
    setEditingId(a.id);
    setEditDraft(a.payload.body);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditDraft("");
  }, []);

  const saveEdit = useCallback(async () => {
    if (!lead || !editingId) return;
    const body = editDraft.trim();
    if (!body) {
      toast.error("Note cannot be empty");
      return;
    }
    setEditSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("lead_activities")
      .update({ payload: { body } })
      .eq("id", editingId)
      .eq("lead_id", lead.id);
    setEditSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Note updated");
    setEditingId(null);
    setEditDraft("");
    await reload();
  }, [lead, editingId, editDraft, reload]);

  const statusBusy = !!(lead && updatingLeadId === lead.id);

  const stopToolbarBubble = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  const toolbar = lead ? (
    <div
      className="flex w-full flex-col gap-2"
      onClick={stopToolbarBubble}
      onPointerDown={stopToolbarBubble}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
          Actions
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {onStatusChange ? (
            <Select
              value={lead.status}
              disabled={statusBusy}
              onValueChange={(v) => onStatusChange(lead.id, v as LeadStatus)}
            >
              <SelectTrigger
                className={cn(
                  "h-9 min-w-[148px] rounded-lg border px-3 text-xs font-semibold shadow-sm transition-shadow hover:shadow",
                  lead.status === "new" &&
                    "border-slate-200/90 bg-white text-slate-800",
                  lead.status === "contacted" &&
                    "border-amber-200/90 bg-amber-50/90 text-amber-950",
                  lead.status === "qualified" &&
                    "border-violet-200/90 bg-violet-50/90 text-violet-900",
                  lead.status === "closed" &&
                    "border-emerald-200/90 bg-emerald-50/90 text-emerald-900"
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-9 gap-1.5 rounded-lg px-3 font-medium shadow-sm transition-all hover:bg-slate-100"
            onClick={scrollToNotes}
          >
            <StickyNote className="size-3.5 opacity-70" />
            Add note
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={followUpSaving}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm outline-none transition-all hover:bg-slate-50 hover:shadow-md focus-visible:ring-2 focus-visible:ring-slate-400/40 disabled:opacity-60"
              )}
            >
              <Bell className="size-3.5 opacity-70" />
              Set reminder
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[12rem]">
              <DropdownMenuItem
                disabled={followUpSaving}
                onClick={() =>
                  void scheduleReminderAt(
                    new Date(Date.now() + 10 * 60 * 1000).toISOString()
                  )
                }
              >
                In 10 minutes
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={followUpSaving}
                onClick={() =>
                  void scheduleReminderAt(
                    new Date(Date.now() + 60 * 60 * 1000).toISOString()
                  )
                }
              >
                In 1 hour
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={followUpSaving}
                onClick={() =>
                  void scheduleReminderAt(
                    dayjs()
                      .add(1, "day")
                      .hour(9)
                      .minute(0)
                      .second(0)
                      .millisecond(0)
                      .toISOString()
                  )
                }
              >
                Tomorrow 9:00 (local)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={followUpSaving}
                onClick={() => {
                  setCustomReminderLocal(
                    dayjs().add(1, "hour").format("YYYY-MM-DDTHH:mm")
                  );
                  setCustomReminderOpen(true);
                }}
              >
                Custom…
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {phone === "—" ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled
              className="h-9 gap-1.5 rounded-lg px-3 font-medium shadow-sm"
              title="No phone on this enquiry"
            >
              <MessageCircle className="size-3.5 opacity-70" />
              WhatsApp
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-200/90 bg-emerald-50/90 px-3 text-xs font-semibold text-emerald-950 shadow-sm outline-none transition-all hover:bg-emerald-100/90 hover:shadow-md focus-visible:ring-2 focus-visible:ring-emerald-400/40 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-100"
                )}
              >
                <MessageCircle className="size-3.5 opacity-80" />
                WhatsApp
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[14rem]">
                {WHATSAPP_TEMPLATES.map((t) => (
                  <DropdownMenuItem
                    key={t.id}
                    onClick={() => openWhatsApp(t.id)}
                  >
                    {t.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200/90 bg-white text-slate-700 shadow-sm outline-none transition-all hover:bg-slate-50 hover:shadow-md focus-visible:ring-2 focus-visible:ring-slate-400/40"
              )}
              aria-label="More actions"
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[11rem]">
              <DropdownMenuItem
                onClick={() => {
                  if (enquiryUrl) void copyToClipboard(enquiryUrl, "Link copied");
                }}
              >
                <Link2 className="size-4 opacity-70" />
                Copy link
              </DropdownMenuItem>
              {email !== "—" ? (
                <DropdownMenuItem
                  onClick={() => void copyToClipboard(email, "Email copied")}
                >
                  <Mail className="size-4 opacity-70" />
                  Copy email
                </DropdownMenuItem>
              ) : null}
              {lead.form_id ? (
                <DropdownMenuItem onClick={() => setFormDetailsOpen(true)}>
                  <FileText className="size-4 opacity-70" />
                  Form structure
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onClose}>Close panel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {nextFollowUp ? (
        <div
          className={cn(
            "flex flex-col gap-2 rounded-xl border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between",
            followUpDue
              ? "border-amber-300/90 bg-amber-50/95 dark:border-amber-700/50 dark:bg-amber-950/35"
              : "border-amber-200/70 bg-amber-50/50 dark:border-amber-800/40 dark:bg-amber-950/25"
          )}
        >
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-amber-800/90 dark:text-amber-200/90">
              Follow-up
            </p>
            <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-100">
              <ClientRelativeTime
                iso={nextFollowUp.remind_at}
                className="font-medium text-slate-900 dark:text-slate-100"
                tick={timeTick}
                absoluteTitle
              />
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 gap-1 rounded-lg px-2.5 text-xs"
              disabled={followUpSaving}
              onClick={() =>
                void setFollowUpStatus(nextFollowUp.id, "completed")
              }
            >
              <Check className="size-3.5" />
              Done
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1 rounded-lg px-2.5 text-xs"
              disabled={followUpSaving}
              onClick={() =>
                void setFollowUpStatus(nextFollowUp.id, "dismissed")
              }
            >
              <X className="size-3.5" />
              Dismiss
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  ) : null;

  const header = lead ? (
    <div className="flex gap-4">
      <div
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-sm font-bold text-white shadow-md ring-4 ring-slate-100 dark:ring-zinc-800"
        aria-hidden
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <h2
          id="lead-drawer-title"
          className="break-words text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50"
        >
          {name !== "—" ? name : "Lead"}
        </h2>
        <p className="text-[13px] text-slate-500">
          {email !== "—" ? (
            <a
              href={`mailto:${email}`}
              className="font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              {email}
            </a>
          ) : (
            <span>No email</span>
          )}
        </p>
        {phone !== "—" ? (
          <p className="text-sm text-slate-500">{phone}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <ScoreBadge
            detail={scoreResult}
            size="md"
            mode={paidInboxFeatures ? "full" : "label-only"}
          />
          <span className="text-slate-300" aria-hidden>
            ·
          </span>
          <LeadStatusBadge status={lead.status} size="md" />
          <span className="text-slate-300" aria-hidden>
            ·
          </span>
          <ClientRelativeTime
            iso={lead.created_at}
            className="text-sm font-medium text-slate-500"
            tick={timeTick}
            absoluteTitle
          />
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
    <LeadDetailDrawer
      open={open && !!lead}
      onClose={onClose}
      header={header}
      toolbar={toolbar}
      variant={variant}
    >
      {lead && (
        <motion.div
          key={lead.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          {textareas.length > 0 ? (
            <DetailSection title="Message">
              {textareas.map((f, i) => {
                const fieldId = f.id;
                const raw = lead.data?.[fieldId];
                const text =
                  typeof raw === "string" ? raw : formatLeadValue(raw);
                const isFirst = i === 0;
                return (
                  <div key={fieldId} className={cn(!isFirst && "pt-1")}>
                    {!isFirst ? (
                      <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {f.label}
                      </p>
                    ) : null}
                    <div
                      className={cn(
                        "rounded-2xl bg-slate-50 px-5 py-5 text-[15px] leading-relaxed text-slate-900 dark:bg-zinc-900/60 dark:text-slate-100",
                        "shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]",
                        "ring-1 ring-slate-900/[0.04] transition-shadow duration-200 hover:shadow-sm dark:ring-white/[0.06]",
                        "whitespace-pre-wrap"
                      )}
                    >
                      {isFirst ? (
                        <span className="sr-only">{f.label}: </span>
                      ) : null}
                      {text || "—"}
                    </div>
                  </div>
                );
              })}
            </DetailSection>
          ) : lead.form_id == null &&
            typeof lead.data?.message === "string" ? (
            <DetailSection title="Message">
              <div
                className={cn(
                  "rounded-2xl bg-slate-50 px-5 py-5 text-[15px] leading-relaxed text-slate-900 dark:bg-zinc-900/60 dark:text-slate-100",
                  "shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]",
                  "ring-1 ring-slate-900/[0.04] whitespace-pre-wrap"
                )}
              >
                {lead.data.message.trim() || "—"}
              </div>
            </DetailSection>
          ) : (
            <DetailSection title="Message">
              <div className="rounded-2xl border border-dashed border-slate-200/90 bg-white/80 px-4 py-6 text-center shadow-sm dark:border-white/10 dark:bg-zinc-950/40">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No message fields in this form.
                </p>
              </div>
            </DetailSection>
          )}

          <Separator className="bg-slate-200/80 dark:bg-white/10" />

          <motion.section
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="ai-insight-shimmer rounded-2xl border border-indigo-200/45 bg-white/75 p-4 shadow-sm backdrop-blur-sm dark:border-indigo-500/30 dark:bg-zinc-950/55"
            aria-label="Lead insight from submission signals"
          >
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <Sparkles className="size-4 shrink-0" aria-hidden />
              <span className={sectionTitle}>Insight</span>
            </div>
            <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              Based on signals detected in this submission (not generative AI).
            </p>
            {paidInboxFeatures ? (
              <>
                <p className="mt-2 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                  {scoreResult.explanation}
                </p>
                {scoreResult.lines.length > 0 ? (
                  <ul className="mt-3 space-y-1.5 border-t border-indigo-200/30 pt-3 text-sm text-slate-600 dark:border-indigo-500/20 dark:text-slate-300">
                    {scoreResult.lines.slice(0, 4).map((line, idx) => (
                      <li key={`${line.label}-${idx}`} className="flex gap-2">
                        <span className="font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
                          +{line.points}
                        </span>
                        <span>{line.label}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </>
            ) : (
              <div className="relative mt-3 space-y-3 rounded-xl border border-dashed border-indigo-200/60 bg-indigo-50/40 p-4 dark:border-indigo-500/35 dark:bg-indigo-950/25">
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                  This lead is marked{" "}
                  <span className="font-semibold">{scoreResult.label}</span> from
                  submission signals. Upgrade to see the numeric score, every scoring
                  factor, and tailored next-step guidance.
                </p>
                <Link
                  href="/dashboard/billing"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "inline-flex rounded-lg font-semibold"
                  )}
                >
                  View plans
                </Link>
              </div>
            )}
          </motion.section>

          <Separator className="bg-slate-200/80 dark:bg-white/10" />

          <DetailSection
            title="Details"
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 rounded-lg border-slate-200/90 text-xs font-semibold shadow-sm transition-all hover:bg-white hover:shadow dark:border-white/10 dark:hover:bg-zinc-800"
                onClick={() => setFormDetailsOpen(true)}
              >
                <FileText className="size-3.5" aria-hidden />
                View form
              </Button>
            }
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {detailRows.map((r) => (
                <DetailCell key={r.key} label={r.label} value={r.value} />
              ))}
            </div>
          </DetailSection>

          <Separator className="bg-slate-200/80 dark:bg-white/10" />

          <DetailSection title="Activity">
            <ActivityFeed
              items={activityItems}
              loading={loading}
              timeTick={timeTick}
            />
          </DetailSection>

          <Separator className="bg-slate-200/80 dark:bg-white/10" />

          <div ref={notesSectionRef} className="scroll-mt-4 space-y-4">
            <DetailSection title="Notes">
            <div className="space-y-2 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.03] transition-shadow hover:shadow-md">
              <Textarea
                id="enquiry-note-draft"
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Write an internal note…"
                className="min-h-[80px] resize-none rounded-lg border-slate-200/90 bg-slate-50/50 text-sm shadow-none transition-colors focus-visible:bg-white"
                disabled={noteSubmitting}
                rows={3}
              />
              <Button
                type="button"
                size="sm"
                className="rounded-lg font-semibold shadow-sm transition-all hover:shadow"
                disabled={noteSubmitting || !noteDraft.trim()}
                onClick={() => void addNote()}
              >
                {noteSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save note"
                )}
              </Button>
            </div>

            <ul className="space-y-2">
              {noteItems.map((n) => {
                const body = getNoteBody(n.payload);
                const isEditing = editingId === n.id;
                return (
                  <li
                    key={n.id}
                    className="group rounded-xl border border-slate-200/70 bg-white px-3 py-3 shadow-sm ring-1 ring-slate-900/[0.02] transition-all duration-200 hover:border-slate-200 hover:shadow-md"
                  >
                    {isEditing ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value)}
                          className="min-h-[80px] resize-none rounded-lg text-sm"
                          disabled={editSaving}
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className="rounded-lg"
                            disabled={editSaving}
                            onClick={() => void saveEdit()}
                          >
                            {editSaving ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              "Save"
                            )}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="rounded-lg"
                            disabled={editSaving}
                            onClick={cancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <p className="min-w-0 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                          {body || "—"}
                        </p>
                        <button
                          type="button"
                          className="shrink-0 rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
                          aria-label="Edit note"
                          onClick={() => startEdit(n)}
                        >
                          <Pencil className="size-4" />
                        </button>
                      </div>
                    )}
                    {!isEditing ? (
                      <ClientRelativeTime
                        iso={n.created_at}
                        className="mt-2 block text-xs font-medium text-slate-500"
                        tick={timeTick}
                        absoluteTitle
                      />
                    ) : null}
                  </li>
                );
              })}
              {noteItems.length === 0 && !loading ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No notes yet.</p>
              ) : null}
            </ul>
            </DetailSection>
          </div>
        </motion.div>
      )}
    </LeadDetailDrawer>
    {lead?.form_id ? (
      <FormDetailsDialog
        open={formDetailsOpen}
        onOpenChange={setFormDetailsOpen}
        formId={lead.form_id}
        formName={formName}
        fields={defsForForm}
      />
    ) : null}

    <Dialog open={customReminderOpen} onOpenChange={setCustomReminderOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Custom reminder</DialogTitle>
          <DialogDescription>
            Pick a local date and time. It is stored as an exact instant.
          </DialogDescription>
        </DialogHeader>
        <Input
          type="datetime-local"
          value={customReminderLocal}
          onChange={(e) => setCustomReminderLocal(e.target.value)}
          className="rounded-lg font-mono text-sm"
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            onClick={() => setCustomReminderOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-lg font-semibold"
            disabled={followUpSaving}
            onClick={() => {
              const d = new Date(customReminderLocal);
              if (Number.isNaN(d.getTime())) {
                toast.error("Invalid date");
                return;
              }
              if (d.getTime() < Date.now()) {
                toast.error("Choose a time in the future");
                return;
              }
              void scheduleReminderAt(d.toISOString());
              setCustomReminderOpen(false);
            }}
          >
            Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
