import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { EnquiriesView } from "./enquiries-view";
import type { LeadFieldDef, LeadRow } from "@/types";

function LeadsTableFallback() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-9 w-48 max-w-full rounded-lg" />
        <Skeleton className="h-4 w-full max-w-lg rounded-md" />
      </div>
      <Skeleton className="h-10 w-full max-w-md rounded-xl" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-10 w-40 rounded-xl" />
        <Skeleton className="h-10 w-48 rounded-xl" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        <div className="space-y-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-slate-100 px-4 py-4 last:border-0"
            >
              <Skeleton className="h-4 flex-1 max-w-[200px] rounded" />
              <Skeleton className="h-4 flex-1 max-w-[240px] rounded" />
              <Skeleton className="h-9 w-[158px] rounded-full" />
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-8 w-16 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
    <Suspense fallback={<LeadsTableFallback />}>
      <EnquiriesView
        initialLeads={(leads ?? []) as LeadRow[]}
        formNames={formNames}
        fieldDefs={fieldDefs}
      />
    </Suspense>
  );
}
