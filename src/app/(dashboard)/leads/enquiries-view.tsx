"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { LeadFieldDef, LeadRow, LeadStatus } from "@/types";
import {
  Eye,
  FilterX,
  Flame,
  Inbox,
  LayoutGrid,
  LayoutList,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EnquiryFormSourceLine } from "@/components/leads/enquiry-form-source-line";
import {
  EnquiryFilters,
  enquiryStatusLabel,
} from "@/components/leads/enquiry-filters";
import {
  isManualEnquiryLead,
  MANUAL_ENTRY_FORM_FILTER,
} from "@/lib/leads/manual-enquiry-filter";
import { leadMatchesNameOrEmail } from "@/lib/leads/search-leads";
import { KanbanBoard } from "@/components/leads/kanban-board";
import { EnquiryDetailPanel } from "@/components/leads/enquiry-detail-panel";
import { useMediaQuery } from "@/hooks/use-media-query";
import { calculateLeadScore } from "@/lib/leads/lead-score";
import { ScoreBadge } from "@/components/leads/score-badge";
import {
  AddEnquiryModal,
  AddEnquiryTriggerButton,
} from "@/components/leads/add-enquiry-modal";
import { ClientLocalDateTime } from "@/components/ui/client-local-datetime";
import { useRelativeTimeTicker } from "@/hooks/use-relative-time-ticker";
import { parseTimestamptz } from "@/lib/timestamptz";

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "closed"];

function compareLeadsByScoreThenRecency(
  a: LeadRow,
  b: LeadRow,
  formNames: Record<string, string>,
  fieldDefs: LeadFieldDef[]
): number {
  const da = calculateLeadScore({ lead: a, formNames, fieldDefs });
  const db = calculateLeadScore({ lead: b, formNames, fieldDefs });
  const rank = (l: (typeof da)["label"]) =>
    l === "Hot" ? 0 : l === "Warm" ? 1 : 2;
  const ra = rank(da.label);
  const rb = rank(db.label);
  if (ra !== rb) return ra - rb;
  if (db.score !== da.score) return db.score - da.score;
  return (
    parseTimestamptz(b.created_at).getTime() -
    parseTimestamptz(a.created_at).getTime()
  );
}

function stopRowActivate(e: React.SyntheticEvent) {
  e.stopPropagation();
}

function leadMatchesEnquiryFormFilter(lead: LeadRow, formFilter: string) {
  if (formFilter === MANUAL_ENTRY_FORM_FILTER) return isManualEnquiryLead(lead);
  return lead.form_id === formFilter;
}

function EnquiriesEmptyState({
  mode,
  hasWorkspaceLeads,
  filtersActive,
  onClearFilters,
  onAddEnquiry,
  canAddManual,
}: {
  mode: "list" | "board";
  hasWorkspaceLeads: boolean;
  filtersActive: boolean;
  onClearFilters: () => void;
  onAddEnquiry: () => void;
  canAddManual: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-dashed border-slate-200/80 bg-gradient-to-b from-white/90 to-slate-50/80 py-14 text-center shadow-premium backdrop-blur-md sm:py-20 dark:border-white/15 dark:from-zinc-950/50 dark:to-zinc-950/30"
    >
      <div className="mx-auto flex max-w-md flex-col items-center px-4">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 shadow-inner ring-1 ring-slate-200/80">
          <Inbox className="size-7" aria-hidden />
        </span>
        <h2 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">
          {!hasWorkspaceLeads
            ? "No enquiries yet"
            : filtersActive
              ? "No enquiries match"
              : "Nothing to show here"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {!hasWorkspaceLeads
            ? "Publish a form or add an enquiry manually — new submissions appear here as they arrive."
            : filtersActive
              ? "Adjust or clear filters and search to see more results."
              : mode === "board"
                ? "When you have leads, drag cards between columns to change status."
                : "Try another view or check back soon."}
        </p>
        <div className="mt-8 flex w-full max-w-sm flex-col items-stretch gap-2 sm:flex-row sm:justify-center">
          {filtersActive ? (
            <Button
              type="button"
              variant="default"
              className="rounded-xl font-semibold shadow-md transition-transform active:scale-[0.99]"
              onClick={onClearFilters}
            >
              <FilterX className="mr-2 size-4" aria-hidden />
              Clear all filters
            </Button>
          ) : null}
          {!hasWorkspaceLeads ? (
            <>
              <Link
                href="/forms"
                className={buttonVariants({
                  variant: "outline",
                  className:
                    "rounded-xl border-slate-200 font-semibold shadow-sm transition-colors hover:bg-slate-50",
                })}
              >
                Create a form
              </Link>
              <Button
                type="button"
                variant={canAddManual ? "secondary" : "outline"}
                className="rounded-xl font-semibold shadow-sm transition-transform active:scale-[0.99] disabled:opacity-60"
                disabled={!canAddManual}
                title={
                  !canAddManual
                    ? "Create a form first to add manual enquiries"
                    : undefined
                }
                onClick={onAddEnquiry}
              >
                Add enquiry
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

function formatLeadValue(v: string | boolean | string[] | undefined): string {
  if (v === undefined || v === null) return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return v.join(", ");
  const s = String(v).trim();
  return s || "—";
}

export function EnquiriesView({
  initialLeads,
  formNames,
  fieldDefs,
}: {
  initialLeads: LeadRow[];
  formNames: Record<string, string>;
  fieldDefs: LeadFieldDef[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadFromQuery = searchParams.get("lead");

  const [leads, setLeads] = useState(initialLeads);
  const [view, setView] = useState<"list" | "board">("list");
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [formFilter, setFormFilter] = useState<"all" | string>("all");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<LeadRow | null>(null);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const [addEnquiryOpen, setAddEnquiryOpen] = useState(false);

  const timeTick = useRelativeTimeTicker(true);

  const isLg = useMediaQuery("(min-width: 1024px)");
  const showSplitDetail = !!detail && view === "list" && isLg;
  const showOverlayDetail = !!detail && (view === "board" || !isLg);

  const formsList = useMemo(
    () =>
      Object.entries(formNames)
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [formNames]
  );

  const fieldById = useMemo(() => {
    const m: Record<string, LeadFieldDef> = {};
    for (const f of fieldDefs) m[f.id] = f;
    return m;
  }, [fieldDefs]);

  useEffect(() => {
    if (!leadFromQuery) return;
    const row = leads.find((l) => l.id === leadFromQuery);
    if (row) setDetail(row);
  }, [leadFromQuery, leads]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (!el) return;
      if (el.closest("input, textarea, select, [contenteditable=true]")) return;
      e.preventDefault();
      document.getElementById("enquiry-filter-search")?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilter("all");
    setFormFilter("all");
    setSearch("");
  }, []);

  const filtersActiveForView = useMemo(() => {
    if (view === "board") {
      return formFilter !== "all" || search.trim() !== "";
    }
    return (
      filter !== "all" ||
      formFilter !== "all" ||
      search.trim() !== ""
    );
  }, [view, filter, formFilter, search]);

  function closeDetail() {
    setDetail(null);
    if (searchParams.get("lead")) {
      router.replace("/leads", { scroll: false });
    }
  }

  const filtered = useMemo(() => {
    let list =
      filter === "all" ? leads : leads.filter((l) => l.status === filter);
    if (formFilter !== "all") {
      list = list.filter((l) => leadMatchesEnquiryFormFilter(l, formFilter));
    }
    return list;
  }, [leads, filter, formFilter]);

  const searchFiltered = useMemo(() => {
    const q = search.trim();
    if (!q) return filtered;
    return filtered.filter((row) => leadMatchesNameOrEmail(row, fieldDefs, q));
  }, [filtered, search, fieldDefs]);

  const prioritySortedLeads = useMemo(() => {
    const copy = [...searchFiltered];
    copy.sort((a, b) =>
      compareLeadsByScoreThenRecency(a, b, formNames, fieldDefs)
    );
    return copy;
  }, [searchFiltered, formNames, fieldDefs]);

  const smartInboxStats = useMemo(() => {
    let hot = 0;
    let warm = 0;
    let newCount = 0;
    let weekCount = 0;
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    for (const lead of leads) {
      if (lead.status === "new") newCount += 1;
      if (now - parseTimestamptz(lead.created_at).getTime() <= weekMs) {
        weekCount += 1;
      }
      const d = calculateLeadScore({ lead, formNames, fieldDefs });
      if (d.label === "Hot") hot += 1;
      else if (d.label === "Warm") warm += 1;
    }
    return { hot, warm, newCount, weekCount };
  }, [leads, formNames, fieldDefs]);

  const pipelineFiltered = useMemo(() => {
    let list = leads;
    if (formFilter !== "all") {
      list = list.filter((l) => leadMatchesEnquiryFormFilter(l, formFilter));
    }
    const q = search.trim();
    if (!q) return list;
    return list.filter((row) => leadMatchesNameOrEmail(row, fieldDefs, q));
  }, [leads, formFilter, search, fieldDefs]);

  const grouped = useMemo(() => {
    const g: Record<LeadStatus, LeadRow[]> = {
      new: [],
      contacted: [],
      qualified: [],
      closed: [],
    };
    for (const lead of pipelineFiltered) {
      g[lead.status].push(lead);
    }
    for (const s of STATUSES) {
      g[s].sort((a, b) =>
        compareLeadsByScoreThenRecency(a, b, formNames, fieldDefs)
      );
    }
    return g;
  }, [pipelineFiltered, formNames, fieldDefs]);

  const updateStatus = useCallback(async (id: string, status: LeadStatus) => {
    const prevLead = leads.find((l) => l.id === id);
    if (!prevLead || prevLead.status === status) return;
    const prevStatus = prevLead.status;

    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    setDetail((d) => (d?.id === id ? { ...d, status } : d));
    setUpdatingLeadId(id);

    const supabase = createClient();
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    setUpdatingLeadId(null);

    if (error) {
      toast.error(error.message);
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: prevStatus } : l))
      );
      setDetail((d) =>
        d?.id === id ? { ...d, status: prevStatus } : d
      );
      return;
    }

    const { error: activityError } = await supabase.from("lead_activities").insert({
      lead_id: id,
      type: "status_change",
      payload: { from: prevStatus, to: status },
      created_at: new Date().toISOString(),
    });
    if (activityError) {
      toast.message("Activity log update skipped", {
        description: activityError.message,
      });
    } else {
      setActivityRefreshKey((k) => k + 1);
    }

    toast.success("Status updated", {
      description: `${enquiryStatusLabel(prevStatus)} → ${enquiryStatusLabel(status)}`,
    });
  }, [leads]);

  const onManualEnquiryAdded = useCallback((lead: LeadRow) => {
    setLeads((prev) => [lead, ...prev]);
    setActivityRefreshKey((k) => k + 1);
  }, []);

  const listEmpty = searchFiltered.length === 0;
  const boardEmpty = pipelineFiltered.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            <Sparkles className="size-3.5 opacity-80" aria-hidden />
            Smart inbox
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
            Enquiries
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
            {view === "list"
              ? "High-intent leads surface first. Filter, search, and open details beside the list on large screens."
              : "Columns mirror your pipeline — drag cards to update status. Hot leads stay easy to spot at the top of each column."}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <AddEnquiryTriggerButton
            onClick={() => setAddEnquiryOpen(true)}
            disabled={formsList.length === 0}
            title={
              formsList.length === 0
                ? "Create a form first to attach manual enquiries."
                : undefined
            }
          />
          <div
            className="inline-flex shrink-0 rounded-2xl border border-slate-200/80 bg-white/70 p-1 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-zinc-950/50"
            role="tablist"
            aria-label="View mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={view === "list"}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                view === "list"
                  ? "bg-white text-slate-900 shadow-md ring-1 ring-slate-200/70 dark:bg-zinc-800 dark:text-slate-100 dark:ring-white/10"
                  : "text-slate-600 hover:bg-white/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
              )}
              onClick={() => setView("list")}
            >
              <LayoutList className="size-4" />
              List
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "board"}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                view === "board"
                  ? "bg-white text-slate-900 shadow-md ring-1 ring-slate-200/70 dark:bg-zinc-800 dark:text-slate-100 dark:ring-white/10"
                  : "text-slate-600 hover:bg-white/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
              )}
              onClick={() => setView("board")}
            >
              <LayoutGrid className="size-4" />
              Board
            </button>
          </div>
        </div>
      </div>

      <EnquiryFilters
        variant={view === "board" ? "pipeline" : "full"}
        status={filter}
        onStatusChange={setFilter}
        formId={formFilter}
        onFormChange={setFormFilter}
        search={search}
        onSearchChange={setSearch}
        forms={formsList}
        onClearAllFilters={clearAllFilters}
      />

      {view === "list" && !listEmpty ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/65 p-4 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-5 dark:border-white/10 dark:bg-zinc-950/45"
        >
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Signals
            </span>
            {smartInboxStats.hot > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200/80 bg-red-50/90 px-3 py-1 text-xs font-semibold text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                <Flame className="size-3.5" aria-hidden />
                {smartInboxStats.hot} hot
              </span>
            ) : null}
            {smartInboxStats.warm > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50/90 px-3 py-1 text-xs font-semibold text-amber-950 dark:border-amber-900/45 dark:bg-amber-950/35 dark:text-amber-100">
                <Zap className="size-3.5" aria-hidden />
                {smartInboxStats.warm} warm
              </span>
            ) : null}
            <span className="inline-flex items-center rounded-full border border-slate-200/80 bg-slate-50/90 px-3 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-zinc-800/80 dark:text-slate-200">
              {smartInboxStats.newCount} new
            </span>
            <span className="inline-flex items-center rounded-full border border-indigo-200/60 bg-indigo-50/80 px-3 py-1 text-xs font-medium text-indigo-900 dark:border-indigo-500/30 dark:bg-indigo-950/40 dark:text-indigo-200">
              {smartInboxStats.weekCount} this week
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:max-w-[280px] sm:text-right">
            <span className="font-medium text-slate-600 dark:text-slate-300">
              Priority order:
            </span>{" "}
            Hot → warm → cold, then newest first — so you always see what deserves attention.
          </p>
        </motion.div>
      ) : null}

      {view === "list" ? (
        listEmpty ? (
          <EnquiriesEmptyState
            mode="list"
            hasWorkspaceLeads={leads.length > 0}
            filtersActive={filtersActiveForView}
            onClearFilters={clearAllFilters}
            onAddEnquiry={() => setAddEnquiryOpen(true)}
            canAddManual={formsList.length > 0}
          />
        ) : (
          <div
            className={cn(
              "overflow-hidden rounded-2xl border border-slate-200/70 bg-white/75 shadow-premium backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/45",
              showSplitDetail &&
                "flex min-h-[min(680px,calc(100dvh-11rem))] flex-row items-stretch"
            )}
          >
            <div
              className={cn(
                "min-w-0 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]",
                showSplitDetail &&
                  "w-[60%] max-h-full min-h-0 flex-shrink-0 overflow-y-auto"
              )}
            >
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="text-slate-500">Enquiry form</TableHead>
                    <TableHead className="text-slate-500">Preview</TableHead>
                    <TableHead className="w-[1%] whitespace-nowrap text-slate-500">
                      Score
                    </TableHead>
                    <TableHead className="text-slate-500">Status</TableHead>
                    <TableHead className="text-slate-500">Received</TableHead>
                    <TableHead className="text-right text-slate-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prioritySortedLeads.map((row) => {
                    const preview = Object.entries(row.data ?? {})
                      .map(([k, v]) => {
                        const label = fieldById[k]?.label ?? k;
                        const text = formatLeadValue(v);
                        return `${label}: ${text}`;
                      })
                      .slice(0, 2)
                      .join(" · ");
                    const scoreResult = calculateLeadScore({
                      lead: row,
                      formNames,
                      fieldDefs,
                    });
                    return (
                      <TableRow
                        key={row.id}
                        tabIndex={0}
                        aria-selected={detail?.id === row.id}
                        data-state={detail?.id === row.id ? "selected" : undefined}
                        className={cn(
                          "cursor-pointer border-slate-100 outline-none transition-[background-color,transform,box-shadow,border-color] duration-200 hover:bg-slate-50/90 active:scale-[0.998] dark:border-white/5 dark:hover:bg-white/[0.04]",
                          "focus-visible:bg-slate-50/90 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 dark:focus-visible:bg-white/[0.06]",
                          scoreResult.label === "Hot" &&
                            "border-l-[3px] border-l-red-400/85 dark:border-l-red-500/70",
                          scoreResult.label === "Warm" &&
                            "border-l-[3px] border-l-amber-400/70 dark:border-l-amber-500/55",
                          detail?.id === row.id &&
                            "bg-primary/[0.06] ring-1 ring-inset ring-primary/10 dark:bg-primary/10"
                        )}
                        onClick={() => setDetail(row)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setDetail(row);
                          }
                        }}
                      >
                        <TableCell className="max-w-[min(200px,40vw)]">
                          <EnquiryFormSourceLine
                            lead={row}
                            formNames={formNames}
                            titleClassName="line-clamp-2 break-words"
                          />
                        </TableCell>
                        <TableCell className="max-w-[min(240px,50vw)] truncate text-slate-500">
                          {preview || "—"}
                        </TableCell>
                        <TableCell
                          className="whitespace-nowrap"
                          onClick={stopRowActivate}
                          onPointerDown={stopRowActivate}
                        >
                          <ScoreBadge detail={scoreResult} size="sm" />
                        </TableCell>
                        <TableCell
                          onClick={stopRowActivate}
                          onPointerDown={stopRowActivate}
                        >
                          <Select
                            value={row.status}
                            disabled={updatingLeadId === row.id}
                            onValueChange={(v) => updateStatus(row.id, v as LeadStatus)}
                          >
                            <SelectTrigger
                              className={cn(
                                "h-9 w-[158px] rounded-full border px-3 text-xs font-medium",
                                row.status === "new" &&
                                  "border-slate-200/90 bg-slate-50 text-slate-800 hover:bg-slate-100/80",
                                row.status === "contacted" &&
                                  "border-amber-200/80 bg-amber-50 text-amber-950 hover:bg-amber-100/80",
                                row.status === "qualified" &&
                                  "border-violet-200/80 bg-violet-50 text-violet-900 hover:bg-violet-100/80",
                                row.status === "closed" &&
                                  "border-emerald-200/80 bg-emerald-50 text-emerald-900 hover:bg-emerald-100/80"
                              )}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s === "new"
                                    ? "New"
                                    : s === "contacted"
                                      ? "Contacted"
                                      : s === "qualified"
                                        ? "Qualified"
                                        : "Closed"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell
                          className="text-sm text-slate-500"
                          onClick={stopRowActivate}
                          onPointerDown={stopRowActivate}
                        >
                          <ClientLocalDateTime iso={row.created_at} />
                        </TableCell>
                        <TableCell
                          className="text-right"
                          onClick={stopRowActivate}
                          onPointerDown={stopRowActivate}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-primary/25 font-semibold text-primary shadow-sm transition-all hover:border-primary/45 hover:bg-primary/[0.06] hover:shadow-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetail(row);
                            }}
                          >
                            <Eye className="mr-1 size-4" aria-hidden />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {showSplitDetail ? (
              <div className="flex h-full min-h-0 w-[40%] flex-shrink-0 flex-col border-l border-slate-200/90">
                <EnquiryDetailPanel
                  variant="embedded"
                  open={!!detail}
                  onClose={closeDetail}
                  lead={detail}
                  formNames={formNames}
                  fieldDefs={fieldDefs}
                  activityRefreshKey={activityRefreshKey}
                  timeTick={timeTick}
                  onStatusChange={updateStatus}
                  updatingLeadId={updatingLeadId}
                />
              </div>
            ) : null}
          </div>
        )
      ) : boardEmpty ? (
        <EnquiriesEmptyState
          mode="board"
          hasWorkspaceLeads={leads.length > 0}
          filtersActive={filtersActiveForView}
          onClearFilters={clearAllFilters}
          onAddEnquiry={() => setAddEnquiryOpen(true)}
          canAddManual={formsList.length > 0}
        />
      ) : (
        <KanbanBoard
          grouped={grouped}
          formNames={formNames}
          fieldDefs={fieldDefs}
          onCardClick={setDetail}
          onStatusChange={updateStatus}
          updatingLeadId={updatingLeadId}
          timeTick={timeTick}
        />
      )}

      <AddEnquiryModal
        open={addEnquiryOpen}
        onOpenChange={setAddEnquiryOpen}
        forms={formsList}
        onSuccess={onManualEnquiryAdded}
      />

      {showOverlayDetail ? (
        <EnquiryDetailPanel
          variant="overlay"
          open={!!detail}
          onClose={closeDetail}
          lead={detail}
          formNames={formNames}
          fieldDefs={fieldDefs}
          activityRefreshKey={activityRefreshKey}
          timeTick={timeTick}
          onStatusChange={updateStatus}
          updatingLeadId={updatingLeadId}
        />
      ) : null}
    </div>
  );
}
