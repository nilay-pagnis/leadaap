"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { NotificationRow } from "@/types/notifications";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useNotifications(userId: string | null) {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());

  const unreadCount = useMemo(
    () => items.filter((n) => n.read_at == null).length,
    [items]
  );

  const refresh = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data, error: qErr } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (qErr) {
      setError(qErr.message);
      setItems([]);
    } else {
      setError(null);
      setItems((data ?? []) as NotificationRow[]);
      seenIdsRef.current = new Set((data ?? []).map((r) => (r as NotificationRow).id));
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as NotificationRow;
          if (!row?.id) return;
          if (seenIdsRef.current.has(row.id)) return;
          seenIdsRef.current.add(row.id);
          setItems((prev) => {
            if (prev.some((p) => p.id === row.id)) return prev;
            return [row, ...prev].slice(0, 50);
          });
          toast.info(row.title, {
            description: row.body ?? undefined,
            duration: 5000,
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as NotificationRow;
          if (!row?.id) return;
          setItems((prev) => prev.map((n) => (n.id === row.id ? row : n)));
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      void supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [userId]);

  const markRead = useCallback(
    async (id: string) => {
      if (!userId) return;
      const supabase = createClient();
      const now = new Date().toISOString();
      const { error: uErr } = await supabase
        .from("notifications")
        .update({ read_at: now })
        .eq("id", id)
        .eq("user_id", userId);

      if (uErr) {
        toast.error(uErr.message);
        return;
      }
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: now } : n))
      );
    },
    [userId]
  );

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    const supabase = createClient();
    const now = new Date().toISOString();
    const { error: uErr } = await supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("user_id", userId)
      .is("read_at", null);

    if (uErr) {
      toast.error(uErr.message);
      return;
    }
    setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? now })));
  }, [userId]);

  return {
    items,
    loading,
    error,
    unreadCount,
    refresh,
    markRead,
    markAllRead,
  };
}
