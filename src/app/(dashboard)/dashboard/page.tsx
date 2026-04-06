import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { LeadRow } from "@/types";
import { DashboardExperience } from "./dashboard-experience";
import { buildDailyLeadSeries, chartCreatedAtGteIso } from "@/lib/dashboard-series";

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

  const chartFromIso = chartCreatedAtGteIso(14);
  const uid = user.id;
  const startDayIso = startOfDay.toISOString();
  const weekAgoIso = weekAgo.toISOString();

  const [
    totalRes,
    newRes,
    workedRes,
    todayRes,
    weekRes,
    chartRes,
    formsRes,
    recentRes,
  ] = await Promise.all([
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", uid),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", uid)
      .eq("status", "new"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", uid)
      .neq("status", "new"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", uid)
      .gte("created_at", startDayIso),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", uid)
      .gte("created_at", weekAgoIso),
    supabase
      .from("leads")
      .select("created_at")
      .eq("user_id", uid)
      .gte("created_at", chartFromIso),
    supabase
      .from("forms")
      .select("id, form_name")
      .eq("user_id", uid)
      .order("created_at", { ascending: true }),
    supabase
      .from("leads")
      .select("id, form_id, data, status, created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const totalLeads = totalRes.count ?? 0;
  const newLeads = newRes.count ?? 0;
  const workedLeads = workedRes.count ?? 0;
  const leadsToday = todayRes.count ?? 0;
  const leadsWeek = weekRes.count ?? 0;
  const chartRows = chartRes.data ?? [];

  const chartSeries = buildDailyLeadSeries(chartRows, 14);

  const formList = formsRes.data ?? [];
  const formCount = formList.length;
  const firstFormId = formList[0]?.id ?? null;

  const formNames: Record<string, string> = {};
  for (const f of formList) {
    formNames[f.id] = f.form_name;
  }

  const conversionRatePct =
    totalLeads > 0
      ? Math.round((workedLeads / totalLeads) * 100)
      : null;

  return (
    <DashboardExperience
      userId={user.id}
      totalLeads={totalLeads}
      newLeads={newLeads}
      leadsToday={leadsToday}
      leadsWeek={leadsWeek}
      conversionRatePct={conversionRatePct}
      formCount={formCount}
      firstFormId={firstFormId}
      recent={(recentRes.data ?? []) as LeadRow[]}
      formNames={formNames}
      chartSeries={chartSeries}
    />
  );
}
