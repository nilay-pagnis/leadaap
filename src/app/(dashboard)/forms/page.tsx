import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FormsClient } from "./forms-client";
import type { FormRow } from "@/types";
import { getUsageForUser } from "@/lib/monetization/get-usage";

export default async function FormsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const usage = await getUsageForUser(user.id);

  const { data } = await supabase
    .from("forms")
    .select("*")
    .order("created_at", { ascending: false });

  const forms = (data ?? []) as FormRow[];

  const formStats: Record<
    string,
    { leads: number; conversionPct: number | null }
  > = {};
  if (forms.length > 0) {
    const { data: leadRows } = await supabase
      .from("leads")
      .select("form_id, status")
      .in(
        "form_id",
        forms.map((f) => f.id)
      );

    const byForm: Record<string, { total: number; worked: number }> = {};
    for (const f of forms) {
      byForm[f.id] = { total: 0, worked: 0 };
    }
    for (const row of leadRows ?? []) {
      const fid = row.form_id as string;
      if (!byForm[fid]) continue;
      byForm[fid].total += 1;
      if (row.status !== "new") byForm[fid].worked += 1;
    }
    for (const f of forms) {
      const { total, worked } = byForm[f.id];
      formStats[f.id] = {
        leads: total,
        conversionPct:
          total > 0 ? Math.round((worked / total) * 100) : null,
      };
    }
  }

  return (
    <FormsClient initialForms={forms} formStats={formStats} usage={usage} />
  );
}
