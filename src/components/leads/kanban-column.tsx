"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import type { FollowUpDueInfo } from "@/types/follow-ups";
import type { LeadFieldDef, LeadRow, LeadStatus } from "@/types";
import { EnquiryCard } from "@/components/leads/enquiry-card";

function columnTitle(status: LeadStatus): string {
  switch (status) {
    case "new":
      return "New";
    case "contacted":
      return "Contacted";
    case "qualified":
      return "Qualified";
    case "closed":
      return "Closed";
    default:
      return status;
  }
}

export type KanbanColumnProps = {
  status: LeadStatus;
  leads: LeadRow[];
  formNames: Record<string, string>;
  fieldDefs: LeadFieldDef[];
  onCardClick: (lead: LeadRow) => void;
  updatingLeadId: string | null;
  timeTick: number;
  followUpDueByLeadId: Record<string, FollowUpDueInfo>;
};

export function KanbanColumn({
  status,
  leads,
  formNames,
  fieldDefs,
  onCardClick,
  updatingLeadId,
  timeTick,
  followUpDueByLeadId,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-0 w-[min(100%,320px)] shrink-0 flex-col rounded-2xl border border-slate-200/90 bg-slate-50/90 shadow-sm transition-[box-shadow,background-color] duration-200",
        isOver && "border-primary/40 bg-primary/[0.06] ring-2 ring-primary/15"
      )}
    >
      <div className="sticky top-0 z-10 shrink-0 rounded-t-2xl border-b border-slate-200/80 bg-slate-50/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">
            {columnTitle(status)}
          </h2>
          <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium tabular-nums text-slate-600 shadow-sm ring-1 ring-slate-200/80">
            {leads.length}
          </span>
        </div>
      </div>
      <div className="flex min-h-[120px] flex-1 flex-col gap-3 overflow-y-auto p-3">
        {leads.map((lead) => (
          <EnquiryCard
            key={lead.id}
            lead={lead}
            formNames={formNames}
            fieldDefs={fieldDefs}
            onOpen={() => onCardClick(lead)}
            isUpdating={updatingLeadId === lead.id}
            timeTick={timeTick}
            followUp={followUpDueByLeadId[lead.id] ?? null}
          />
        ))}
      </div>
    </div>
  );
}
