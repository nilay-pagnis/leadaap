"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { ChevronDown, ChevronUp, LayoutGrid } from "lucide-react";
import { EnquiryFormSourceLine } from "@/components/leads/enquiry-form-source-line";
import { KanbanColumn } from "@/components/leads/kanban-column";
import { getLeadNameAndEmail } from "@/lib/leads/lead-display";
import { calculateLeadScore } from "@/lib/leads/lead-score";
import { ScoreBadge } from "@/components/leads/score-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClientRelativeTime } from "@/components/ui/client-relative-time";
import { cn } from "@/lib/utils";
import type { FollowUpDueInfo } from "@/types/follow-ups";
import type { LeadFieldDef, LeadRow, LeadStatus } from "@/types";

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "closed"];

export const KANBAN_COLUMN_ORDER_STORAGE_KEY = "enquireo-kanban-column-order-v1";

function isValidOrder(arr: unknown): arr is LeadStatus[] {
  if (!Array.isArray(arr) || arr.length !== STATUSES.length) return false;
  const set = new Set(STATUSES);
  const seen = new Set<string>();
  for (const s of arr) {
    if (typeof s !== "string" || !set.has(s as LeadStatus) || seen.has(s))
      return false;
    seen.add(s);
  }
  return seen.size === STATUSES.length;
}

function loadColumnOrder(): LeadStatus[] {
  if (typeof window === "undefined") return [...STATUSES];
  try {
    const raw = localStorage.getItem(KANBAN_COLUMN_ORDER_STORAGE_KEY);
    if (!raw) return [...STATUSES];
    const parsed = JSON.parse(raw) as unknown;
    return isValidOrder(parsed) ? parsed : [...STATUSES];
  } catch {
    return [...STATUSES];
  }
}

function persistColumnOrder(order: LeadStatus[]) {
  try {
    localStorage.setItem(
      KANBAN_COLUMN_ORDER_STORAGE_KEY,
      JSON.stringify(order)
    );
  } catch {
    /* ignore */
  }
}

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
  leadId: string,
  columnOrder: LeadStatus[]
): LeadStatus | null {
  for (const status of columnOrder) {
    if (grouped[status].some((l) => l.id === leadId)) return status;
  }
  return null;
}

function KanbanDragPreview({
  lead,
  formNames,
  fieldDefs,
  timeTick,
  scoreMode,
}: {
  lead: LeadRow;
  formNames: Record<string, string>;
  fieldDefs: LeadFieldDef[];
  timeTick: number;
  scoreMode: "full" | "label-only";
}) {
  const { name, email } = getLeadNameAndEmail(lead, fieldDefs);
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
      <EnquiryFormSourceLine
        lead={lead}
        formNames={formNames}
        className="mt-2"
        titleClassName="truncate text-xs"
      />
      <div className="mt-2">
        <ScoreBadge detail={scoreResult} size="sm" mode={scoreMode} />
      </div>
      <ClientRelativeTime
        iso={lead.created_at}
        className="mt-1.5 block text-xs text-slate-400"
        tick={timeTick}
      />
    </div>
  );
}

function ColumnOrderDialog({
  open,
  onOpenChange,
  order,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: LeadStatus[];
  onSave: (next: LeadStatus[]) => void;
}) {
  const [draft, setDraft] = useState<LeadStatus[]>(order);

  useEffect(() => {
    if (open) setDraft(order);
  }, [open, order]);

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

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= draft.length) return;
    const next = [...draft];
    [next[i], next[j]] = [next[j], next[i]];
    setDraft(next);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Pipeline column order</DialogTitle>
          <DialogDescription>
            Reorder how stages appear on your board. This layout is saved on this device only.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 py-2">
          {draft.map((s, i) => (
            <li
              key={s}
              className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2.5 dark:border-white/10 dark:bg-zinc-900/40"
            >
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {statusLabel(s)}
              </span>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                  disabled={i === 0}
                  aria-label="Move up"
                  onClick={() => move(i, -1)}
                >
                  <ChevronUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                  disabled={i === draft.length - 1}
                  aria-label="Move down"
                  onClick={() => move(i, 1)}
                >
                  <ChevronDown className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => {
              setDraft([...STATUSES]);
            }}
          >
            Reset default
          </Button>
          <Button
            type="button"
            className="rounded-xl"
            onClick={() => {
              onSave(draft);
              onOpenChange(false);
            }}
          >
            Save order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type KanbanBoardProps = {
  grouped: Record<LeadStatus, LeadRow[]>;
  formNames: Record<string, string>;
  fieldDefs: LeadFieldDef[];
  onCardClick: (lead: LeadRow) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void | Promise<void>;
  updatingLeadId: string | null;
  timeTick: number;
  followUpDueByLeadId: Record<string, FollowUpDueInfo>;
  /** Free plan: board is view-only; change status from the lead panel or list view. */
  dragEnabled?: boolean;
  /** Paid: reorder pipeline columns (persisted locally). */
  allowColumnReorder?: boolean;
  scoreMode?: "full" | "label-only";
};

export function KanbanBoard({
  grouped,
  formNames,
  fieldDefs,
  onCardClick,
  onStatusChange,
  updatingLeadId,
  timeTick,
  followUpDueByLeadId,
  dragEnabled = true,
  allowColumnReorder = false,
  scoreMode = "full",
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [columnOrder, setColumnOrder] = useState<LeadStatus[]>(STATUSES);
  const [columnsOpen, setColumnsOpen] = useState(false);

  useEffect(() => {
    if (!allowColumnReorder) {
      setColumnOrder([...STATUSES]);
      return;
    }
    setColumnOrder(loadColumnOrder());
  }, [allowColumnReorder]);

  const onSaveColumnOrder = useCallback((next: LeadStatus[]) => {
    setColumnOrder(next);
    persistColumnOrder(next);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const activeLead = useMemo(() => {
    if (!activeId) return null;
    for (const status of columnOrder) {
      const hit = grouped[status].find((l) => l.id === activeId);
      if (hit) return hit;
    }
    return null;
  }, [activeId, grouped, columnOrder]);

  const onDragStart = useCallback((e: DragStartEvent) => {
    if (!dragEnabled) return;
    setActiveId(String(e.active.id));
  }, [dragEnabled]);

  const onDragEnd = useCallback(
    (e: DragEndEvent) => {
      setActiveId(null);
      if (!dragEnabled) return;
      const leadId = String(e.active.id);
      const overId = e.over?.id;
      if (!isLeadStatus(overId)) return;
      const from = findLeadStatus(grouped, leadId, columnOrder);
      if (from === null || from === overId) return;
      void onStatusChange(leadId, overId);
    },
    [grouped, onStatusChange, columnOrder, dragEnabled]
  );

  const onDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        {!dragEnabled ? (
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              View-only board on Free —
            </span>{" "}
            open a card and use status controls there, or switch to List view. Upgrade to drag cards
            between stages.
          </p>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Drag cards between columns to update status.
          </p>
        )}
        {allowColumnReorder ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 rounded-xl border-slate-200"
              onClick={() => setColumnsOpen(true)}
            >
              <LayoutGrid className="mr-1.5 size-4" aria-hidden />
              Column order
            </Button>
            <ColumnOrderDialog
              open={columnsOpen}
              onOpenChange={setColumnsOpen}
              order={columnOrder}
              onSave={onSaveColumnOrder}
            />
          </>
        ) : null}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={kanbanCollision}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <div className="flex min-h-[min(70vh,720px)] gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
          {columnOrder.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              leads={grouped[status]}
              formNames={formNames}
              fieldDefs={fieldDefs}
              onCardClick={onCardClick}
              updatingLeadId={updatingLeadId}
              timeTick={timeTick}
              followUpDueByLeadId={followUpDueByLeadId}
              dragEnabled={dragEnabled}
              scoreMode={scoreMode}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
          {activeLead && dragEnabled ? (
            <KanbanDragPreview
              lead={activeLead}
              formNames={formNames}
              fieldDefs={fieldDefs}
              timeTick={timeTick}
              scoreMode={scoreMode}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
