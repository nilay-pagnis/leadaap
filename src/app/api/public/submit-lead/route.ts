import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizePublicLeadData } from "@/lib/leads/sanitize-public-submission";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
} as const;

function logError(context: string, err: unknown) {
  console.error(`[api/public/submit-lead] ${context}:`, err);
}

/**
 * Public lead submission — no auth, no profiles, no plan/credit checks.
 * Inserts a row for the form owner (user_id from forms table).
 */
export async function POST(request: Request) {
  let body: {
    form_id?: string;
    data?: Record<string, unknown>;
    source?: string;
    plan?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const formId = body.form_id;
  const data = body.data;
  if (!formId || typeof data !== "object" || data === null) {
    return NextResponse.json(
      { error: "form_id and data are required" },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const attributionSource =
    typeof body.source === "string" ? body.source : undefined;
  const attributionPlan = typeof body.plan === "string" ? body.plan : undefined;

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
      .select("id, user_id")
      .eq("id", formId)
      .maybeSingle();

    if (formError || !form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404, headers: NO_STORE_HEADERS }
      );
    }

    const { data: fields, error: fieldsError } = await admin
      .from("fields")
      .select("id, label, type, required, options")
      .eq("form_id", formId)
      .order("sort_order", { ascending: true });

    if (fieldsError) {
      logError("fields query", fieldsError);
      return NextResponse.json(
        { error: "Could not load form fields" },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    const fieldList = fields ?? [];
    const validated = sanitizePublicLeadData(fieldList, data, {
      source: attributionSource,
      plan: attributionPlan,
    });

    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const { error: insertError } = await admin.from("leads").insert({
      form_id: form.id,
      user_id: form.user_id,
      data: validated.sanitized,
      status: "new",
    });

    if (insertError) {
      logError("leads insert", insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS });
  } catch (e) {
    logError("unhandled", e);
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
