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
  const isHot = scoreResult.label === "Hot";
  const isWarm = scoreResult.label === "Warm";

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
        "rounded-2xl border border-slate-200/75 bg-white/85 p-3 shadow-sm backdrop-blur-md transition-[transform,box-shadow,opacity,border-color] duration-300",
        "hover:-translate-y-1 hover:border-indigo-200/60 hover:shadow-premium dark:border-white/10 dark:bg-zinc-950/50 dark:hover:border-indigo-500/35 dark:hover:shadow-soft-lg",
        isHot && "border-l-[3px] border-l-red-400/80 pl-2.5 dark:border-l-red-500/65",
        isWarm && !isHot && "border-l-[3px] border-l-amber-400/65 pl-2.5 dark:border-l-amber-500/50",
        isDragging && "z-10 opacity-50 shadow-lg ring-2 ring-primary/25",
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
