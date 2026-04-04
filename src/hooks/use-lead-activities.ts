"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LeadActivity } from "@/types";
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
  if (typeof row.created_at !== "string" || !row.created_at.trim()) return null;
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

/** When the server never inserted a `created` row, show one timeline entry using the lead row time (same instant as submission). */
export function mergeWithSyntheticCreated(
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

export function useLeadActivities(
  leadId: string | null,
  leadCreatedAt: string,
  refreshKey = 0
) {
  const [items, setItems] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!leadId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("lead_activities")
      .select("id, lead_id, type, payload, created_at")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setItems(mergeWithSyntheticCreated([], leadId, leadCreatedAt));
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

  const activityItems = useMemo(
    () => items.filter((a) => a.type === "created" || a.type === "status_change"),
    [items]
  );

  const noteItems = useMemo(
    () => items.filter((a) => a.type === "note"),
    [items]
  );

  return { items, activityItems, noteItems, loading, reload: load };
}
