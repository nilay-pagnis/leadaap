"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buildDailyLeadSeries, chartCreatedAtGteIso } from "@/lib/dashboard-series";
import { LeadsChart } from "@/components/dashboard/leads-chart";

export type ChartSeriesPoint = { iso: string; label: string; count: number };

type Props = {
  userId: string;
  initialSeries: ChartSeriesPoint[];
};

/**
 * Inbox volume chart with live updates when a new lead is inserted for this user.
 * Requires `public.leads` in the `supabase_realtime` publication (see supabase/realtime_leads.sql).
 */
export function DashboardInboxVolume({ userId, initialSeries }: Props) {
  const [series, setSeries] = useState<ChartSeriesPoint[]>(initialSeries);
  const supabase = createClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSeries(initialSeries);
  }, [initialSeries]);

  const refetchSeries = useCallback(async () => {
    const from = chartCreatedAtGteIso(14);
    const { data, error } = await supabase
      .from("leads")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", from);

    if (error) {
      console.error("[dashboard chart] refetch", error);
      return;
    }
    setSeries(buildDailyLeadSeries(data ?? [], 14));
  }, [supabase, userId]);

  const scheduleRefetch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      void refetchSeries();
    }, 350);
  }, [refetchSeries]);

  useEffect(() => {
    const channel = supabase
      .channel(`dashboard-leads-volume:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "leads",
          filter: `user_id=eq.${userId}`,
        },
        () => scheduleRefetch()
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.warn(
            "[dashboard chart] Realtime subscription failed — enable Replication for public.leads (see supabase/realtime_leads.sql)"
          );
        }
      });

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      void supabase.removeChannel(channel);
    };
  }, [supabase, userId, scheduleRefetch]);

  return <LeadsChart series={series} />;
}
