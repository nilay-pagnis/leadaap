import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LeadsTable } from "./leads-table";
import type { LeadFieldDef, LeadRow } from "@/types";

export default async function LeadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: forms } = await supabase.from("forms").select("id, form_name");

  const formNames: Record<string, string> = {};
  const formIds: string[] = [];
  for (const f of forms ?? []) {
    formNames[f.id] = f.form_name;
    formIds.push(f.id);
  }

  let fieldDefs: LeadFieldDef[] = [];
  if (formIds.length > 0) {
    const { data: fields } = await supabase
      .from("fields")
      .select("id, form_id, label, type")
      .in("form_id", formIds);
    fieldDefs = (fields ?? []) as LeadFieldDef[];
  }

  return (
    <LeadsTable
      initialLeads={(leads ?? []) as LeadRow[]}
      formNames={formNames}
      fieldDefs={fieldDefs}
    />
  );
}
