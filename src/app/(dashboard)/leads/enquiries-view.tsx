"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { LeadFieldDef, LeadRow, LeadStatus } from "@/types";
import { Eye, LayoutGrid, LayoutList } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EnquiryFilters } from "@/components/leads/enquiry-filters";
import { LeadDetailDrawer } from "@/components/leads/lead-detail-drawer";
import { leadMatchesNameOrEmail } from "@/lib/leads/search-leads";
import { KanbanBoard } from "@/components/leads/kanban-board";

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "closed"];

function formatLeadValue(v: string | boolean | string[] | undefined): string {
  if (v === undefined || v === null) return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return v.join(", ");
  const s = String(v).trim();
  return s || "—";
}

function FieldValueBlock({
  raw,
  isSelect,
}: {
  raw: string | boolean | string[];
  isSelect: boolean;
}) {
  const display = formatLeadValue(raw);
  if (isSelect && typeof raw === "string" && raw) {
    return (
      <span className="inline-flex max-w-full items-center rounded-md bg-primary/10 px-2 py-1 text-base font-medium text-primary">
        <span className="truncate">{raw}</span>
      </span>
    );
  }
  return (
    <p className="break-words text-base font-medium leading-snug text-slate-900">
      {display}
    </p>
  );
}

function LeadDetailMainColumn({
  data,
  fieldById,
}: {
  data: Record<string, string | boolean | string[]>;
  fieldById: Record<string, LeadFieldDef>;
}) {
  const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
  const textareaEntries = entries.filter(
    ([id]) => fieldById[id]?.type === "textarea"
  );
  const otherEntries = entries.filter(
    ([id]) => fieldById[id]?.type !== "textarea"
  );

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
        <p className="text-sm text-slate-500">No submission data</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {textareaEntries.map(([fieldId, raw]) => {
        const meta = fieldById[fieldId];
        const label = meta?.label ?? fieldId;
        const text = typeof raw === "string" ? raw : formatLeadValue(raw);
        return (
          <div key={fieldId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
            <div className="mt-3 rounded-xl bg-slate-50 p-4 text-base font-medium leading-relaxed whitespace-pre-wrap text-slate-900">
              {text || "—"}
            </div>
          </div>
        );
      })}

      {otherEntries.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Details</h3>
          <div className="mt-5 flex flex-col gap-5">
            {otherEntries.map(([fieldId, raw]) => {
              const meta = fieldById[fieldId];
              const label = meta?.label ?? fieldId;
              const isSelect = meta?.type === "select";
              return (
                <div
                  key={fieldId}
                  className="min-w-0 border-b border-slate-100 pb-5 last:border-0 last:pb-0"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {label}
                  </p>
                  <div className="mt-2 min-w-0">
                    <FieldValueBlock raw={raw} isSelect={isSelect} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function LeadDetailMetaColumn({
  status,
  submittedAt,
  formName,
}: {
  status: LeadStatus;
  submittedAt: string;
  formName: string;
}) {
  return (
    <aside className="h-fit rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Record</p>
      <dl className="mt-4 space-y-4">
        <div>
          <dt className="text-xs text-slate-500">Status</dt>
          <dd className="mt-1.5">
            <LeadStatusBadge status={status} size="md" />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Submitted</dt>
          <dd className="mt-1 text-sm font-medium text-slate-900">{submittedAt}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Enquiry form</dt>
          <dd className="mt-1 break-words text-sm font-medium text-slate-900">{formName}</dd>
        </div>
      </dl>
    </aside>
  );
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
      list = list.filter((l) => l.form_id === formFilter);
    }
    return list;
  }, [leads, filter, formFilter]);

  const searchFiltered = useMemo(() => {
    const q = search.trim();
    if (!q) return filtered;
    return filtered.filter((row) => leadMatchesNameOrEmail(row, fieldDefs, q));
  }, [filtered, search, fieldDefs]);

  const pipelineFiltered = useMemo(() => {
    let list = leads;
    if (formFilter !== "all") {
      list = list.filter((l) => l.form_id === formFilter);
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
      g[s].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return g;
  }, [pipelineFiltered]);

  const updateStatus = useCallback(async (id: string, status: LeadStatus) => {
    const prevLead = leads.find((l) => l.id === id);
    const prevStatus = prevLead?.status;
    if (!prevLead || prevStatus === status) return;

    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    setDetail((d) => (d?.id === id ? { ...d, status } : d));
    setUpdatingLeadId(id);

    const supabase = createClient();
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    setUpdatingLeadId(null);

    if (error) {
      toast.error(error.message);
      setLeads((prev) =>
        prev.map((l) => (l.id === id && prevStatus ? { ...l, status: prevStatus } : l))
      );
      setDetail((d) =>
        d?.id === id && prevStatus ? { ...d, status: prevStatus } : d
      );
      return;
    }
    toast.success("Status updated");
  }, [leads]);

  const listEmpty = searchFiltered.length === 0;
  const boardEmpty = pipelineFiltered.length === 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Inbox</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Enquiries
          </h1>
          <p className="max-w-lg text-sm text-slate-600 sm:text-base">
            {view === "list"
              ? "Search, filter, and open an enquiry in the side panel."
              : "Drag cards between columns to update status. Use the grip handle to drag."}
          </p>
        </div>
        <div
          className="inline-flex shrink-0 rounded-xl border border-slate-200/90 bg-slate-50/90 p-1 shadow-sm"
          role="tablist"
          aria-label="View mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === "list"}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              view === "list"
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
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
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              view === "board"
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            )}
            onClick={() => setView("board")}
          >
            <LayoutGrid className="size-4" />
            Board
          </button>
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
      />

      {view === "list" ? (
        listEmpty ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm sm:py-20"
          >
            <p className="font-medium text-slate-900">No enquiries match</p>
            <p className="mt-2 text-sm text-slate-500">Try another search or filter.</p>
          </motion.div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)]">
            <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="text-slate-500">Enquiry form</TableHead>
                    <TableHead className="text-slate-500">Preview</TableHead>
                    <TableHead className="text-slate-500">Status</TableHead>
                    <TableHead className="text-slate-500">Received</TableHead>
                    <TableHead className="text-right text-slate-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchFiltered.map((row) => {
                    const preview = Object.entries(row.data ?? {})
                      .map(([k, v]) => {
                        const label = fieldById[k]?.label ?? k;
                        const text = formatLeadValue(v);
                        return `${label}: ${text}`;
                      })
                      .slice(0, 2)
                      .join(" · ");
                    return (
                      <TableRow
                        key={row.id}
                        className="cursor-pointer border-slate-100 transition-colors hover:bg-slate-50/90"
                        onClick={() => setDetail(row)}
                      >
                        <TableCell className="max-w-[min(200px,40vw)] font-medium text-slate-900">
                          <span className="line-clamp-2 break-words">
                            {formNames[row.form_id] ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[min(240px,50vw)] truncate text-slate-500">
                          {preview || "—"}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={row.status}
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
                        <TableCell className="text-sm text-slate-500">
                          {new Date(row.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-xl text-primary hover:bg-primary/10"
                            onClick={() => setDetail(row)}
                          >
                            <Eye className="mr-1 size-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )
      ) : boardEmpty ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm sm:py-20"
        >
          <p className="font-medium text-slate-900">No enquiries match</p>
          <p className="mt-2 text-sm text-slate-500">Try another search or filter.</p>
        </motion.div>
      ) : (
        <KanbanBoard
          grouped={grouped}
          formNames={formNames}
          fieldDefs={fieldDefs}
          onCardClick={setDetail}
          onStatusChange={updateStatus}
          updatingLeadId={updatingLeadId}
        />
      )}

      <LeadDetailDrawer
        open={!!detail}
        onClose={closeDetail}
        title="Enquiry details"
        subtitle="Full submission"
      >
        {detail && (
          <motion.div
            key={detail.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col gap-8"
          >
            <div className="flex flex-wrap items-center gap-3">
              <LeadStatusBadge status={detail.status} size="md" />
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-10">
              <section className="min-w-0 lg:col-span-7">
                <LeadDetailMainColumn data={detail.data ?? {}} fieldById={fieldById} />
              </section>
              <section className="min-w-0 lg:col-span-3">
                <LeadDetailMetaColumn
                  status={detail.status}
                  submittedAt={new Date(detail.created_at).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  formName={formNames[detail.form_id] ?? detail.form_id}
                />
              </section>
            </div>
          </motion.div>
        )}
      </LeadDetailDrawer>
    </div>
  );
}
