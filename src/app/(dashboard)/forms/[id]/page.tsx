import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FormBuilder } from "@/components/forms/form-builder";
import type { FieldRow, FormRow } from "@/types";

function normalizeFields(rows: FieldRow[] | null): FieldRow[] {
  if (!rows) return [];
  return rows.map((f) => ({
    ...f,
    options: Array.isArray(f.options)
      ? (f.options as unknown[]).map(String)
      : [],
  }));
}

export default async function FormEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: form, error } = await supabase
    .from("forms")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !form) notFound();

  const { data: fields } = await supabase
    .from("fields")
    .select("*")
    .eq("form_id", id)
    .order("sort_order", { ascending: true });

  return (
    <FormBuilder form={form as FormRow} initialFields={normalizeFields(fields as FieldRow[] | null)} />
  );
}
