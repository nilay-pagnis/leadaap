"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLeadNameAndEmail } from "@/lib/leads/lead-display";
import { formatRelativeTime } from "@/lib/format-relative";
import type { LeadFieldDef, LeadRow } from "@/types";

export type EnquiryCardProps = {
  lead: LeadRow;
  formNames: Record<string, string>;
  fieldDefs: LeadFieldDef[];
  onOpen: () => void;
  isUpdating?: boolean;
};

export function EnquiryCard({
  lead,
  formNames,
  fieldDefs,
  onOpen,
  isUpdating,
}: EnquiryCardProps) {
  const { name, email } = getLeadNameAndEmail(lead, fieldDefs);
  const formName = formNames[lead.form_id] ?? "—";
  const when = formatRelativeTime(lead.created_at);

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
        "rounded-xl border border-slate-200/90 bg-white p-3 shadow-sm transition-[transform,box-shadow,opacity] duration-200",
        "hover:-translate-y-0.5 hover:shadow-md",
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
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={onOpen}
        >
          <p className="line-clamp-2 text-sm font-semibold text-slate-900">{name}</p>
          <p className="mt-1 truncate text-xs text-slate-500">{email}</p>
          <p className="mt-2 truncate text-xs font-medium text-primary">{formName}</p>
          <p className="mt-1.5 text-xs text-slate-400">{when}</p>
          <p className="mt-2 text-xs text-slate-400">Open for notes and activity</p>
        </button>
      </div>
    </div>
  );
}
