"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type FormSearchHit = { id: string; form_name: string };
export type LeadSearchHit = {
  id: string;
  form_id: string;
  data: Record<string, unknown>;
  created_at: string;
};

export function useDashboardSearch(
  userId: string | null,
  query: string,
  enabled: boolean
) {
  const [forms, setForms] = useState<FormSearchHit[]>([]);
  const [leads, setLeads] = useState<LeadSearchHit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !userId) {
      setForms([]);
      setLeads([]);
      setLoading(false);
      return;
    }

    const q = query.trim();
    if (q.length < 1) {
      setForms([]);
      setLeads([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const handle = window.setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const low = q.toLowerCase();

      const [{ data: formsData, error: fErr }, { data: leadsData, error: lErr }] =
        await Promise.all([
          supabase
            .from("forms")
            .select("id, form_name")
            .eq("user_id", userId)
            .ilike("form_name", `%${q}%`)
            .order("created_at", { ascending: false })
            .limit(12),
          supabase
            .from("leads")
            .select("id, form_id, data, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(60),
        ]);

      if (cancelled) return;

      if (fErr) console.error("[search] forms", fErr);
      if (lErr) console.error("[search] leads", lErr);

      const leadHits = (leadsData ?? []).filter((row) => {
        const d = (row.data ?? {}) as Record<string, unknown>;
        return JSON.stringify(d).toLowerCase().includes(low);
      });

      setForms((formsData ?? []) as FormSearchHit[]);
      setLeads(leadHits.slice(0, 12) as LeadSearchHit[]);
      setLoading(false);
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [query, userId, enabled]);

  return { forms, leads, loading };
}
