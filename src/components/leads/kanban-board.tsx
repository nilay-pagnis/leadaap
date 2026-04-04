"use client";

import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "@/components/leads/kanban-column";
import { getLeadNameAndEmail } from "@/lib/leads/lead-display";
import { calculateLeadScore } from "@/lib/leads/lead-score";
import { ScoreBadge } from "@/components/leads/score-badge";
import { formatRelativeTime } from "@/lib/format-relative";
import { cn } from "@/lib/utils";
import type { LeadFieldDef, LeadRow, LeadStatus } from "@/types";

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "closed"];

const kanbanCollision: CollisionDetection = (args) => {
  const withPointer = pointerWithin(args);
  if (withPointer.length > 0) return withPointer;
  return rectIntersection(args);
};

function isLeadStatus(id: string | number | undefined): id is LeadStatus {
  if (id === undefined) return false;
  const s = String(id);
  return STATUSES.includes(s as LeadStatus);
}

function findLeadStatus(
  grouped: Record<LeadStatus, LeadRow[]>,
  leadId: string
): LeadStatus | null {
  for (const status of STATUSES) {
    if (grouped[status].some((l) => l.id === leadId)) return status;
  }
  return null;
}

function KanbanDragPreview({
  lead,
  formNames,
  fieldDefs,
}: {
  lead: LeadRow;
  formNames: Record<string, string>;
  fieldDefs: LeadFieldDef[];
}) {
  const { name, email } = getLeadNameAndEmail(lead, fieldDefs);
  const formName = formNames[lead.form_id] ?? "—";
  const when = formatRelativeTime(lead.created_at);
  const scoreResult = calculateLeadScore({
    lead,
    formNames,
    fieldDefs,
  });
  return (
    <div
      className={cn(
        "w-[min(280px,calc(100vw-3rem))] cursor-grabbing rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xl ring-2 ring-primary/25"
      )}
    >
      <p className="line-clamp-2 text-sm font-semibold text-slate-900">{name}</p>
      <p className="mt-1 truncate text-xs text-slate-500">{email}</p>
      <p className="mt-2 truncate text-xs font-medium text-primary">{formName}</p>
      <div className="mt-2">
        <ScoreBadge detail={scoreResult} size="sm" />
      </div>
      <p className="mt-1.5 text-xs text-slate-400">{when}</p>
    </div>
  );
}

export type KanbanBoardProps = {
  grouped: Record<LeadStatus, LeadRow[]>;
  formNames: Record<string, string>;
  fieldDefs: LeadFieldDef[];
  onCardClick: (lead: LeadRow) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void | Promise<void>;
  updatingLeadId: string | null;
};

export function KanbanBoard({
  grouped,
  formNames,
  fieldDefs,
  onCardClick,
  onStatusChange,
  updatingLeadId,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const activeLead = useMemo(() => {
    if (!activeId) return null;
    for (const status of STATUSES) {
      const hit = grouped[status].find((l) => l.id === activeId);
      if (hit) return hit;
    }
    return null;
  }, [activeId, grouped]);

  const onDragStart = useCallback((e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  }, []);

  const onDragEnd = useCallback(
    (e: DragEndEvent) => {
      setActiveId(null);
      const leadId = String(e.active.id);
      const overId = e.over?.id;
      if (!isLeadStatus(overId)) return;
      const from = findLeadStatus(grouped, leadId);
      if (from === null || from === overId) return;
      void onStatusChange(leadId, overId);
    },
    [grouped, onStatusChange]
  );

  const onDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={kanbanCollision}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="flex min-h-[min(70vh,720px)] gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            leads={grouped[status]}
            formNames={formNames}
            fieldDefs={fieldDefs}
            onCardClick={onCardClick}
            updatingLeadId={updatingLeadId}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
        {activeLead ? (
          <KanbanDragPreview
            lead={activeLead}
            formNames={formNames}
            fieldDefs={fieldDefs}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
