"use client";

import { useCallback, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getLeadNameAndEmail } from "@/lib/leads/lead-display";
import { formatRelativeTime } from "@/lib/format-relative";
import type { LeadFieldDef, LeadRow } from "@/types";

const NOTE_KEY = (leadId: string) => `enquireo:lead-note:${leadId}`;

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

  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");

  const openNoteDialog = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      setNoteDraft(localStorage.getItem(NOTE_KEY(lead.id)) ?? "");
    } catch {
      setNoteDraft("");
    }
    setNoteOpen(true);
  }, [lead.id]);

  const saveNote = useCallback(() => {
    try {
      localStorage.setItem(NOTE_KEY(lead.id), noteDraft);
    } catch {
      /* ignore quota */
    }
    setNoteOpen(false);
  }, [lead.id, noteDraft]);

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
        </button>
      </div>
      <div className="mt-2 flex justify-end border-t border-slate-100 pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1 rounded-lg px-2 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          onClick={(e) => {
            e.preventDefault();
            openNoteDialog();
          }}
        >
          <StickyNote className="size-3.5" />
          Add note
        </Button>
        <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
          <DialogContent className="sm:max-w-md" showCloseButton>
            <DialogHeader>
              <DialogTitle>Note</DialogTitle>
            </DialogHeader>
            <Textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Private note (saved on this device only)…"
              className="min-h-28 rounded-xl"
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setNoteOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={saveNote}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
