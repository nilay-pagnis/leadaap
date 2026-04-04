import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizePublicLeadData } from "@/lib/leads/sanitize-public-submission";
import { normalizePlanId, PLAN_LIMITS } from "@/lib/monetization/plans";
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

function monthStartUtcIso(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)
  ).toISOString();
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
      .select("id, user_id, form_name")
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

    // Backend plan enforcement (public endpoint): monthly lead cap per workspace owner.
    const { data: profileRow, error: profileErr } = await admin
      .from("profiles")
      .select("plan")
      .eq("id", form.user_id)
      .maybeSingle();
    if (profileErr || !profileRow) {
      return NextResponse.json(
        { error: "Could not load workspace plan" },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }
    const ownerPlan = normalizePlanId((profileRow as { plan?: unknown }).plan);
    const monthlyLeadCap = PLAN_LIMITS[ownerPlan].creditAllocation;
    const { count: monthLeadCount, error: leadsCountErr } = await admin
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", form.user_id)
      .gte("created_at", monthStartUtcIso());
    if (leadsCountErr) {
      logError("leads monthly count", leadsCountErr);
      return NextResponse.json(
        { error: "Could not validate plan limits" },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }
    if ((monthLeadCount ?? 0) >= monthlyLeadCap) {
      return NextResponse.json(
        {
          error: "Lead limit reached. You've reached your limit. Upgrade to continue.",
          code: "LEAD_LIMIT",
        },
        { status: 403, headers: NO_STORE_HEADERS }
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

    const { data: leadRow, error: insertError } = await admin
      .from("leads")
      .insert({
        form_id: form.id,
        user_id: form.user_id,
        data: validated.sanitized,
        status: "new",
      })
      .select("id")
      .single();

    if (insertError || !leadRow) {
      logError("leads insert", insertError);
      return NextResponse.json(
        { error: insertError?.message ?? "Could not save lead" },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    const { error: activityErr } = await admin.from("lead_activities").insert({
      lead_id: leadRow.id,
      type: "created",
      payload: {},
      created_at: new Date().toISOString(),
    });
    if (activityErr) {
      logError("lead_activities insert", activityErr);
    }

    const formName = (form as { form_name?: string }).form_name ?? "Your form";
    const { error: notifErr } = await admin.from("notifications").insert({
      user_id: form.user_id,
      type: "lead_received",
      title: "You received a new enquiry",
      body: `Submission on “${formName}”.`,
      link: "/inbox",
      metadata: { lead_id: leadRow.id, form_id: form.id },
    });
    if (notifErr) {
      logError("notifications insert", notifErr);
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
