"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLeadNameAndEmail } from "@/lib/leads/lead-display";
import { calculateLeadScore } from "@/lib/leads/lead-score";
import { ScoreBadge } from "@/components/leads/score-badge";
import { EnquiryFormSourceLine } from "@/components/leads/enquiry-form-source-line";
import { ClientRelativeTime } from "@/components/ui/client-relative-time";
import type { LeadFieldDef, LeadRow } from "@/types";

export type EnquiryCardProps = {
  lead: LeadRow;
  formNames: Record<string, string>;
  fieldDefs: LeadFieldDef[];
  onOpen: () => void;
  isUpdating?: boolean;
  timeTick: number;
};

export function EnquiryCard({
  lead,
  formNames,
  fieldDefs,
  onOpen,
  isUpdating,
  timeTick,
}: EnquiryCardProps) {
  const { name, email } = getLeadNameAndEmail(lead, fieldDefs);
  const scoreResult = calculateLeadScore({
    lead,
    formNames,
    fieldDefs,
  });

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    disabled: isUpdating,
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border border-slate-200/90 bg-white p-3 shadow-sm transition-[transform,box-shadow,opacity,border-color] duration-200",
        "hover:-translate-y-0.5 hover:border-slate-300/90 hover:shadow-md",
        isDragging && "z-10 opacity-50 shadow-lg ring-2 ring-primary/20",
        isUpdating && "pointer-events-none opacity-70"
      )}
      {...attributes}
    >
      <div className="flex gap-2">
        <button
          type="button"
          className={cn(
            "mt-0.5 shrink-0 touch-none rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600",
            isUpdating && "pointer-events-none"
          )}
          aria-label="Drag to move"
          disabled={isUpdating}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            className="w-full text-left"
            onClick={onOpen}
          >
            <p className="line-clamp-2 text-sm font-semibold text-slate-900">{name}</p>
            <p className="mt-1 truncate text-xs text-slate-500">{email}</p>
            <EnquiryFormSourceLine
              lead={lead}
              formNames={formNames}
              className="mt-2"
              titleClassName="truncate text-xs"
            />
            <ClientRelativeTime
              iso={lead.created_at}
              className="mt-1.5 block text-xs text-slate-400"
              tick={timeTick}
            />
            <p className="mt-2 text-xs text-slate-400">Open for notes and activity</p>
          </button>
          <div className="mt-2">
            <ScoreBadge detail={scoreResult} size="sm" className="max-w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
