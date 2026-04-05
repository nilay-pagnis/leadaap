"use client";

import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { MANUAL_ENTRY_FORM_FILTER } from "@/lib/leads/manual-enquiry-filter";
import { leadStatusLabel } from "@/lib/leads/lead-status-label";
import type { LeadStatus } from "@/types";

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "closed"];

export const enquiryStatusLabel = leadStatusLabel;

export type EnquiryFiltersProps = {
  /** `pipeline` hides status (Kanban); columns represent status. */
  variant?: "full" | "pipeline";
  status: LeadStatus | "all";
  onStatusChange: (v: LeadStatus | "all") => void;
  formId: "all" | string;
  onFormChange: (v: "all" | string) => void;
  search: string;
  onSearchChange: (v: string) => void;
  forms: { id: string; name: string }[];
  className?: string;
  /** Resets status, form, and search in one action (shown with active filter chips). */
  onClearAllFilters?: () => void;
};

export function EnquiryFilters({
  variant = "full",
  status,
  onStatusChange,
  formId,
  onFormChange,
  search,
  onSearchChange,
  forms,
  className,
  onClearAllFilters,
}: EnquiryFiltersProps) {
  const isPipeline = variant === "pipeline";
  const activeCount =
    (isPipeline ? 0 : status !== "all" ? 1 : 0) +
    (formId !== "all" ? 1 : 0) +
    (search.trim() !== "" ? 1 : 0);

  const triggerActive = "ring-2 ring-primary/25 border-primary/30 shadow-sm";

  const formDisplayLabel =
    formId === "all"
      ? "All forms"
      : formId === MANUAL_ENTRY_FORM_FILTER
        ? "Manual Entry"
        : (forms.find((f) => f.id === formId)?.name ?? "All forms");

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/65 p-4 shadow-sm backdrop-blur-xl sm:p-5 dark:border-white/10 dark:bg-zinc-950/45",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Filters
        </p>
        {activeCount > 0 ? (
          <Badge variant="secondary" className="rounded-full font-normal">
            {activeCount} active
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        {!isPipeline && (
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:max-w-[200px]">
            <label className="text-xs font-medium text-slate-600" htmlFor="enquiry-filter-status">
              Status
            </label>
            <Select
              value={status}
              onValueChange={(v) => onStatusChange(v as LeadStatus | "all")}
            >
              <SelectTrigger
                id="enquiry-filter-status"
                className={cn(
                  "h-10 w-full rounded-xl",
                  status !== "all" ? triggerActive : "border-slate-200"
                )}
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {enquiryStatusLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:max-w-[240px]">
          <label className="text-xs font-medium text-slate-600" htmlFor="enquiry-filter-form">
            Form
          </label>
          <Select
            value={formId}
            onValueChange={(v) => onFormChange(v as "all" | string)}
          >
            <SelectTrigger
              id="enquiry-filter-form"
              className={cn(
                "h-10 w-full rounded-xl",
                formId !== "all" ? triggerActive : "border-slate-200"
              )}
            >
              <SelectValue placeholder="Form">{formDisplayLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All forms</SelectItem>
              <SelectItem value={MANUAL_ENTRY_FORM_FILTER}>
                Manual Entry
              </SelectItem>
              {forms.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 flex-1 lg:min-w-[min(100%,280px)] lg:flex-[2]">
          <label className="sr-only" htmlFor="enquiry-filter-search">
            Search by name or email
          </label>
          <div className="relative">
            <Search
              className={cn(
                "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2",
                search.trim() ? "text-primary" : "text-slate-400"
              )}
              aria-hidden
            />
            <Input
              id="enquiry-filter-search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name or email…"
              title="Tip: press / to focus this field when not typing elsewhere"
              className={cn(
                "h-10 rounded-xl border-slate-200 bg-white pl-9 shadow-sm transition-[box-shadow,border-color]",
                search.trim() ? triggerActive : ""
              )}
              aria-label="Search by name or email"
            />
          </div>
        </div>
      </div>

      {activeCount > 0 ? (
        <div
          className="flex flex-col gap-2 border-t border-slate-200/80 pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
          role="region"
          aria-label="Active filters"
        >
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {!isPipeline && status !== "all" ? (
              <FilterChip
                onRemove={() => onStatusChange("all")}
                removeLabel={`Remove status filter ${enquiryStatusLabel(status)}`}
              >
                Status: {enquiryStatusLabel(status)}
              </FilterChip>
            ) : null}
            {formId !== "all" ? (
              <FilterChip
                onRemove={() => onFormChange("all")}
                removeLabel={`Remove form filter ${formDisplayLabel}`}
              >
                Form: <span className="max-w-[140px] truncate">{formDisplayLabel}</span>
              </FilterChip>
            ) : null}
            {search.trim() ? (
              <FilterChip
                onRemove={() => onSearchChange("")}
                removeLabel="Remove search filter"
              >
                Search:{" "}
                <span className="max-w-[120px] truncate font-normal">
                  &ldquo;{search.trim().slice(0, 40)}
                  {search.trim().length > 40 ? "…" : ""}
                  &rdquo;
                </span>
              </FilterChip>
            ) : null}
          </div>
          {onClearAllFilters ? (
            <button
              type="button"
              className="shrink-0 text-left text-xs font-semibold text-primary underline-offset-2 transition-colors hover:text-primary/80 hover:underline"
              onClick={onClearAllFilters}
            >
              Clear all filters
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function FilterChip({
  children,
  onRemove,
  removeLabel,
}: {
  children: ReactNode;
  onRemove: () => void;
  removeLabel: string;
}) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-slate-200/90 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-900/[0.04] transition-[box-shadow,background-color] hover:bg-slate-50 hover:shadow-md">
      <span className="flex min-w-0 items-center gap-1">{children}</span>
      <button
        type="button"
        className="shrink-0 rounded-full p-0.5 text-slate-500 transition-colors hover:bg-slate-200/80 hover:text-slate-900"
        onClick={(e) => {
          e.preventDefault();
          onRemove();
        }}
        aria-label={removeLabel}
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </span>
  );
}
