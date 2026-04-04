"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
import { FilterX, Inbox, LayoutGrid, LayoutList, Sparkles } from "lucide-react";
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
import { calculateLeadScore, type LeadScoreResult } from "@/lib/leads/lead-score";
import { ScoreBadge } from "@/components/leads/score-badge";
import {
  AddEnquiryModal,
  AddEnquiryTriggerButton,
} from "@/components/leads/add-enquiry-modal";
import { ClientRelativeTime } from "@/components/ui/client-relative-time";
import { useRelativeTimeTicker } from "@/hooks/use-relative-time-ticker";
import { parseTimestamptz } from "@/lib/timestamptz";
import { getLeadNameAndEmail } from "@/lib/leads/lead-display";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";

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
  if (
    formFilter === MANUAL_ENTRY_FORM_FILTER ||
    formFilter === "__manual_entry__"
  ) {
    return isManualEnquiryLead(lead);
  }
  return lead.form_id === formFilter;
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

function InboxEmptyState({
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
        <h2 className="mt-5 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {!hasWorkspaceLeads
            ? "Inbox is empty"
            : filtersActive
              ? "Nothing matches"
              : "Nothing to show here"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {!hasWorkspaceLeads
            ? "Publish a form or add a lead manually — submissions land here automatically."
            : filtersActive
              ? "Adjust or clear filters and search to see more."
              : mode === "board"
                ? "Drag cards between columns to change status."
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
                    ? "Create a form first to add manual leads"
                    : undefined
                }
                onClick={onAddEnquiry}
              >
                Add manually
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

const BUCKETS = [
  { key: "hot" as const, label: "Hot", barClass: "bg-red-500/90" },
  { key: "warm" as const, label: "Warm", barClass: "bg-amber-500/90" },
  { key: "cold" as const, label: "Cold", barClass: "bg-sky-500/80" },
];

export function InboxView({
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
      router.replace("/inbox", { scroll: false });
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

  const { scoreMap, groupedByTemperature } = useMemo(() => {
    const map = new Map<string, LeadScoreResult>();
    for (const lead of searchFiltered) {
      map.set(
        lead.id,
        calculateLeadScore({ lead, formNames, fieldDefs })
      );
    }
    const hot: LeadRow[] = [];
    const warm: LeadRow[] = [];
    const cold: LeadRow[] = [];
    for (const lead of searchFiltered) {
      const d = map.get(lead.id)!;
      if (d.label === "Hot") hot.push(lead);
      else if (d.label === "Warm") warm.push(lead);
      else cold.push(lead);
    }
    const cmp = (a: LeadRow, b: LeadRow) => {
      const da = map.get(a.id)!;
      const db = map.get(b.id)!;
      if (db.score !== da.score) return db.score - da.score;
      return (
        parseTimestamptz(b.created_at).getTime() -
        parseTimestamptz(a.created_at).getTime()
      );
    };
    hot.sort(cmp);
    warm.sort(cmp);
    cold.sort(cmp);
    return {
      scoreMap: map,
      groupedByTemperature: { hot, warm, cold },
    };
  }, [searchFiltered, formNames, fieldDefs]);

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

  const bucketLeads = {
    hot: groupedByTemperature.hot,
    warm: groupedByTemperature.warm,
    cold: groupedByTemperature.cold,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            <Sparkles className="size-3.5 opacity-80" aria-hidden />
            Workspace inbox
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
            Inbox
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
            {view === "list"
              ? "Hot, warm, and cold groups keep priority obvious. Open a thread on the right on large screens."
              : "Pipeline board — drag cards to update status. High-signal leads float to the top of each column."}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <AddEnquiryTriggerButton
            onClick={() => setAddEnquiryOpen(true)}
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

      {view === "list" ? (
        listEmpty ? (
          <InboxEmptyState
            mode="list"
            hasWorkspaceLeads={leads.length > 0}
            filtersActive={filtersActiveForView}
            onClearFilters={clearAllFilters}
            onAddEnquiry={() => setAddEnquiryOpen(true)}
            canAddManual
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
                "min-w-0 min-h-0 flex-shrink-0 overflow-y-auto overflow-x-hidden",
                showSplitDetail ? "w-[40%] max-h-full" : "w-full"
              )}
            >
              <div className="p-2 sm:p-3">
                {BUCKETS.map((bucket) => {
                  const rows = bucketLeads[bucket.key];
                  if (rows.length === 0) return null;
                  return (
                    <section
                      key={bucket.key}
                      className="mb-4 last:mb-0"
                      aria-label={`${bucket.label} leads`}
                    >
                      <div
                        className={cn(
                          "sticky top-0 z-[1] flex items-center gap-2 rounded-xl px-2 py-2 backdrop-blur-md",
                          "border-b border-slate-200/60 bg-white/90 dark:border-white/10 dark:bg-zinc-950/90"
                        )}
                      >
                        <span
                          className={cn("size-1.5 shrink-0 rounded-full", bucket.barClass)}
                          aria-hidden
                        />
                        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                          {bucket.label}
                        </span>
                        <span className="text-xs tabular-nums text-slate-400 dark:text-slate-500">
                          {rows.length}
                        </span>
                      </div>
                      <ul
                        className="mt-1 space-y-1"
                        role="listbox"
                        aria-label={`${bucket.label} priority leads`}
                      >
                        {rows.map((row) => {
                          const scoreResult = scoreMap.get(row.id)!;
                          const { name, email } = getLeadNameAndEmail(
                            row,
                            fieldDefs
                          );
                          const initials = getInitials(name, email);
                          const selected = detail?.id === row.id;
                          return (
                            <motion.li
                              key={row.id}
                              layout="position"
                              initial={false}
                              role="option"
                              aria-selected={selected}
                              tabIndex={0}
                              data-state={selected ? "selected" : undefined}
                              className={cn(
                                "list-none flex cursor-pointer gap-3 rounded-xl border border-transparent p-2.5 outline-none transition-all duration-200",
                                "hover:bg-slate-50/95 dark:hover:bg-white/[0.04]",
                                "focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
                                selected &&
                                  "border-primary/20 bg-primary/[0.07] ring-1 ring-inset ring-primary/15 dark:bg-primary/10",
                                scoreResult.label === "Hot" &&
                                  "border-l-[3px] border-l-red-400/85 pl-2 dark:border-l-red-500/70",
                                scoreResult.label === "Warm" &&
                                  !selected &&
                                  "border-l-[3px] border-l-amber-400/70 pl-2 dark:border-l-amber-500/55"
                              )}
                              onClick={() => setDetail(row)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setDetail(row);
                                }
                              }}
                            >
                                <div
                                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-xs font-bold text-white shadow-sm ring-2 ring-white dark:ring-zinc-900"
                                  aria-hidden
                                >
                                  {initials}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                      {name !== "—" ? name : "Unknown"}
                                    </p>
                                    <ClientRelativeTime
                                      iso={row.created_at}
                                      className="shrink-0 text-[11px] font-medium text-slate-400 dark:text-slate-500"
                                      tick={timeTick}
                                    />
                                  </div>
                                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                    {email !== "—" ? email : "No email"}
                                  </p>
                                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                    <EnquiryFormSourceLine
                                      lead={row}
                                      formNames={formNames}
                                      titleClassName="max-w-[140px] truncate text-[11px]"
                                    />
                                    <LeadStatusBadge
                                      status={row.status}
                                      size="sm"
                                    />
                                  </div>
                                  <div
                                    className="mt-2"
                                    onClick={stopRowActivate}
                                    onPointerDown={stopRowActivate}
                                  >
                                    <ScoreBadge
                                      detail={scoreResult}
                                      size="sm"
                                    />
                                  </div>
                                  <div
                                    className="mt-2"
                                    onClick={stopRowActivate}
                                    onPointerDown={stopRowActivate}
                                  >
                                    <Select
                                      value={row.status}
                                      disabled={updatingLeadId === row.id}
                                      onValueChange={(v) =>
                                        updateStatus(row.id, v as LeadStatus)
                                      }
                                    >
                                      <SelectTrigger
                                        className={cn(
                                          "h-8 w-full max-w-[200px] rounded-lg border px-2 text-[11px] font-medium",
                                          row.status === "new" &&
                                            "border-slate-200/90 bg-slate-50 dark:border-white/10 dark:bg-zinc-800",
                                          row.status === "contacted" &&
                                            "border-amber-200/80 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30",
                                          row.status === "qualified" &&
                                            "border-violet-200/80 bg-violet-50 dark:border-violet-900/40 dark:bg-violet-950/30",
                                          row.status === "closed" &&
                                            "border-emerald-200/80 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/30"
                                        )}
                                      >
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {STATUSES.map((s) => (
                                          <SelectItem key={s} value={s}>
                                            {enquiryStatusLabel(s)}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                            </motion.li>
                          );
                        })}
                      </ul>
                    </section>
                  );
                })}
              </div>
            </div>
            {showSplitDetail ? (
              <div className="flex h-full min-h-0 w-[60%] flex-shrink-0 flex-col border-l border-slate-200/90 dark:border-white/10">
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
        <InboxEmptyState
          mode="board"
          hasWorkspaceLeads={leads.length > 0}
          filtersActive={filtersActiveForView}
          onClearFilters={clearAllFilters}
          onAddEnquiry={() => setAddEnquiryOpen(true)}
          canAddManual
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
