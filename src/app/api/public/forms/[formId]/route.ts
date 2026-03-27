import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

/** Always read fresh form + fields from the database (no CDN / route cache). */
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
} as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  if (!formId) {
    return NextResponse.json({ error: "Missing form id" }, { status: 400 });
  }

  try {
    let admin;
    try {
      admin = createAdminClient();
    } catch {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 503, headers: NO_STORE_HEADERS }
      );
    }
    const { data: form, error: formError } = await admin
      .from("forms")
      .select("id, form_name, user_id")
      .eq("id", formId)
      .maybeSingle();

    if (formError || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    let company_name: string | null = null;
    const ownerId = (form as { user_id?: string }).user_id;
    if (ownerId) {
      const { data: profile } = await admin
        .from("profiles")
        .select("company_name")
        .eq("id", ownerId)
        .maybeSingle();
      const raw = (profile as { company_name?: string | null } | null)
        ?.company_name;
      company_name = raw?.trim() ? raw.trim() : null;
    }

    const { data: fields, error: fieldsError } = await admin
      .from("fields")
      .select("id, label, type, required, sort_order, options")
      .eq("form_id", formId)
      .order("sort_order", { ascending: true });

    if (fieldsError) {
      return NextResponse.json(
        { error: fieldsError.message },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    const normalized = (fields ?? []).map((row: Record<string, unknown>) => ({
      ...row,
      options: Array.isArray(row.options)
        ? (row.options as unknown[]).map(String)
        : [],
    }));

    return NextResponse.json(
      {
        form: {
          id: form.id,
          form_name: form.form_name,
          company_name,
        },
        fields: normalized,
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
