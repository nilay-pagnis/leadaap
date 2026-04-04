import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { EnquiryTableSkeleton } from "@/components/leads/enquiry-table-skeleton";
import { InboxView } from "./inbox-view";
import type { LeadFieldDef, LeadRow } from "@/types";

function InboxFallback() {
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
      <EnquiryTableSkeleton rows={5} />
    </div>
  );
}

export default async function InboxPage() {
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
    <Suspense fallback={<InboxFallback />}>
      <InboxView
        initialLeads={(leads ?? []) as LeadRow[]}
        formNames={formNames}
        fieldDefs={fieldDefs}
      />
    </Suspense>
  );
}
