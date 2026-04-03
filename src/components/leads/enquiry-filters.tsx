"use client";

import { Search } from "lucide-react";
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
import type { LeadStatus } from "@/types";

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "closed"];

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
      : forms.find((f) => f.id === formId)?.name ?? "All forms";

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white/80 p-4 shadow-sm sm:p-5",
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
                    {statusLabel(s)}
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
              className={cn(
                "h-10 rounded-xl border-slate-200 bg-white pl-9 shadow-sm transition-[box-shadow,border-color]",
                search.trim() ? triggerActive : ""
              )}
              aria-label="Search by name or email"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
