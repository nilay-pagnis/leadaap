import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { LeadRow } from "@/types";
import { DashboardExperience } from "./dashboard-experience";
import { buildDailyLeadSeries } from "@/lib/dashboard-series";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);

  const chartFrom = new Date();
  chartFrom.setDate(chartFrom.getDate() - 13);
  chartFrom.setHours(0, 0, 0, 0);

  const { count: totalLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true });

  const { count: newLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("status", "new");

  const { count: workedLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .neq("status", "new");

  const { count: leadsToday } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfDay.toISOString());

  const { count: leadsWeek } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .gte("created_at", weekAgo.toISOString());

  const { data: chartRows } = await supabase
    .from("leads")
    .select("created_at")
    .gte("created_at", chartFrom.toISOString());

  const chartSeries = buildDailyLeadSeries(chartRows ?? [], 14);

  const { data: forms } = await supabase
    .from("forms")
    .select("id, form_name")
    .order("created_at", { ascending: true });

  const formList = forms ?? [];
  const formCount = formList.length;
  const firstFormId = formList[0]?.id ?? null;

  const formNames: Record<string, string> = {};
  for (const f of formList) {
    formNames[f.id] = f.form_name;
  }

  const conversionRatePct =
    (totalLeads ?? 0) > 0
      ? Math.round(((workedLeads ?? 0) / (totalLeads ?? 1)) * 100)
      : null;

  const { data: recent } = await supabase
    .from("leads")
    .select("id, form_id, data, status, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <DashboardExperience
      totalLeads={totalLeads ?? 0}
      newLeads={newLeads ?? 0}
      leadsToday={leadsToday ?? 0}
      leadsWeek={leadsWeek ?? 0}
      conversionRatePct={conversionRatePct}
      formCount={formCount}
      firstFormId={firstFormId}
      recent={(recent ?? []) as LeadRow[]}
      formNames={formNames}
      chartSeries={chartSeries}
    />
  );
}
