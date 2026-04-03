"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, Inbox, Loader2, StickyNote } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format-relative";
import { formatActivityMessage } from "@/lib/leads/activity-messages";
import type { LeadActivity, LeadActivityType } from "@/types";
import { toast } from "sonner";

function normalizeRow(row: {
  id: string;
  lead_id: string;
  type: string;
  payload: unknown;
  created_at: string;
}): LeadActivity | null {
  const t = row.type;
  if (t !== "created" && t !== "status_change" && t !== "note") return null;
  return {
    id: row.id,
    lead_id: row.lead_id,
    type: t,
    payload: (typeof row.payload === "object" && row.payload !== null
      ? row.payload
      : {}) as LeadActivity["payload"],
    created_at: row.created_at,
  };
}

function mergeWithSyntheticCreated(
  rows: LeadActivity[],
  leadId: string,
  leadCreatedAt: string
): LeadActivity[] {
  const hasCreated = rows.some((a) => a.type === "created");
  const next = [...rows];
  if (!hasCreated) {
    next.push({
      id: `synthetic-created-${leadId}`,
      lead_id: leadId,
      type: "created",
      payload: {},
      created_at: leadCreatedAt,
    });
  }
  next.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  return next;
}

function activityIcon(type: LeadActivityType) {
  const cls = "size-3.5 shrink-0 text-slate-400";
  switch (type) {
    case "created":
      return <Inbox className={cls} aria-hidden />;
    case "status_change":
      return <ArrowRightLeft className={cls} aria-hidden />;
    case "note":
      return <StickyNote className={cls} aria-hidden />;
    default:
      return null;
  }
}

export type ActivityTimelineProps = {
  leadId: string;
  leadCreatedAt: string;
  /** Bump after external events (e.g. status change) to refetch. */
  refreshKey?: number;
  onActivitiesChange?: () => void;
  className?: string;
};

export function ActivityTimeline({
  leadId,
  leadCreatedAt,
  refreshKey = 0,
  onActivitiesChange,
  className,
}: ActivityTimelineProps) {
  const [items, setItems] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("lead_activities")
      .select("id, lead_id, type, payload, created_at")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setItems(
        mergeWithSyntheticCreated([], leadId, leadCreatedAt)
      );
      setLoading(false);
      return;
    }

    const normalized = (data ?? [])
      .map((row) => normalizeRow(row as Parameters<typeof normalizeRow>[0]))
      .filter((x): x is LeadActivity => x !== null);

    setItems(mergeWithSyntheticCreated(normalized, leadId, leadCreatedAt));
    setLoading(false);
  }, [leadId, leadCreatedAt]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const absoluteTitle = useCallback((iso: string) => {
    try {
      return new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return iso;
    }
  }, []);

  const addNote = useCallback(async () => {
    const body = noteDraft.trim();
    if (!body || noteSubmitting) return;
    setNoteSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("lead_activities").insert({
      lead_id: leadId,
      type: "note",
      payload: { body },
    });
    setNoteSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setNoteDraft("");
    toast.success("Note added");
    onActivitiesChange?.();
    await load();
  }, [leadId, noteDraft, noteSubmitting, load, onActivitiesChange]);

  const displayItems = useMemo(() => items, [items]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Add note
        </p>
        <Textarea
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          placeholder="Write an internal note…"
          className="min-h-[72px] rounded-xl border-slate-200 text-sm"
          disabled={noteSubmitting}
          rows={3}
        />
        <Button
          type="button"
          size="sm"
          className="rounded-xl"
          disabled={noteSubmitting || !noteDraft.trim()}
          onClick={() => void addNote()}
        >
          {noteSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Add note"
          )}
        </Button>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Activity
        </p>
        {loading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" />
            Loading…
          </div>
        ) : displayItems.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No activity yet.</p>
        ) : (
          <div className="relative mt-4">
            <div
              className="absolute top-2 bottom-2 left-[7px] w-px bg-slate-200"
              aria-hidden
            />
            <ul className="relative m-0 list-none space-y-0 p-0">
            {displayItems.map((activity, i) => (
              <li
                key={activity.id}
                className="relative flex gap-3 pb-6 pl-0 last:pb-0"
              >
                <div className="relative z-[1] flex shrink-0 justify-center pt-0.5">
                  <span className="flex size-4 items-center justify-center rounded-full border border-slate-200 bg-white ring-2 ring-white">
                    <span className="flex size-2 rounded-full bg-slate-300" />
                  </span>
                </div>
                <div
                  className={cn(
                    "min-w-0 flex-1 rounded-lg px-2 py-2 transition-colors",
                    "hover:bg-slate-50/80",
                    i === 0 && "pt-0"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5">{activityIcon(activity.type)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug text-slate-800">
                        {formatActivityMessage(activity)}
                      </p>
                      <time
                        className="mt-1 block text-xs text-slate-500"
                        dateTime={activity.created_at}
                        title={absoluteTitle(activity.created_at)}
                      >
                        {formatRelativeTime(activity.created_at)}
                      </time>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
