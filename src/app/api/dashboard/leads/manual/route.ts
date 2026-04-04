import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  buildManualLeadData,
  buildStandaloneManualLeadData,
  manualSourceLabel,
  type ManualEnquirySource,
} from "@/lib/leads/build-manual-lead-data";
import { MANUAL_VIRTUAL_FORM_ID } from "@/lib/leads/manual-enquiry-filter";
import {
  isUnlimitedCredits,
  normalizePlanId,
  PLAN_LIMITS,
} from "@/lib/monetization/plans";
import type { FieldRowForManual } from "@/lib/leads/build-manual-lead-data";
import type { LeadRow, LeadStatus } from "@/types";

export const dynamic = "force-dynamic";

const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
} as const;

const SOURCES: ManualEnquirySource[] = [
  "manual",
  "call",
  "whatsapp",
  "referral",
];

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "closed"];

function monthStartUtcIso(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)
  ).toISOString();
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function simpleEmailOk(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function POST(request: Request) {
  let body: {
    name?: unknown;
    email?: unknown;
    phone?: unknown;
    message?: unknown;
    source?: unknown;
    form_id?: unknown;
    status?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400, headers: NO_STORE }
    );
  }

  if (!isNonEmptyString(body.name)) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400, headers: NO_STORE }
    );
  }
  if (!isNonEmptyString(body.message)) {
    return NextResponse.json(
      { error: "Message is required" },
      { status: 400, headers: NO_STORE }
    );
  }

  const emailRaw =
    typeof body.email === "string" && body.email.trim()
      ? body.email.trim()
      : undefined;
  if (emailRaw && !simpleEmailOk(emailRaw)) {
    return NextResponse.json(
      { error: "Enter a valid email address" },
      { status: 400, headers: NO_STORE }
    );
  }

  const phoneRaw =
    typeof body.phone === "string" && body.phone.trim()
      ? body.phone.trim()
      : undefined;

  const source = body.source;
  if (typeof source !== "string" || !SOURCES.includes(source as ManualEnquirySource)) {
    return NextResponse.json(
      { error: "Invalid source" },
      { status: 400, headers: NO_STORE }
    );
  }

  let status: LeadStatus = "new";
  if (typeof body.status === "string" && STATUSES.includes(body.status as LeadStatus)) {
    status = body.status as LeadStatus;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();
  if (profileErr) {
    return NextResponse.json(
      { error: "Could not load plan" },
      { status: 500, headers: NO_STORE }
    );
  }
  const plan = normalizePlanId((profile as { plan?: unknown } | null)?.plan);
  const monthlyLeadCap = PLAN_LIMITS[plan].creditAllocation;
  const { count: monthLeadCount, error: countErr } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", monthStartUtcIso());
  if (countErr) {
    return NextResponse.json(
      { error: "Could not validate plan limits" },
      { status: 500, headers: NO_STORE }
    );
  }
  if (
    !isUnlimitedCredits(monthlyLeadCap) &&
    (monthLeadCount ?? 0) >= monthlyLeadCap
  ) {
    return NextResponse.json(
      {
        error:
          "Lead limit reached for this billing period. Upgrade your plan to add more.",
        code: "LEAD_LIMIT",
      },
      { status: 403, headers: NO_STORE }
    );
  }

  const requestedForm =
    typeof body.form_id === "string" && body.form_id.trim()
      ? body.form_id.trim()
      : null;

  if (requestedForm === MANUAL_VIRTUAL_FORM_ID) {
    const data = buildStandaloneManualLeadData({
      name: body.name.trim(),
      email: emailRaw,
      phone: phoneRaw,
      message: body.message.trim(),
      source: source as ManualEnquirySource,
    });

    const { data: inserted, error: insertErr } = await supabase
      .from("leads")
      .insert({
        form_id: null,
        user_id: user.id,
        data,
        status,
      })
      .select("*")
      .single();

    if (insertErr || !inserted) {
      return NextResponse.json(
        { error: insertErr?.message ?? "Could not save enquiry" },
        { status: 500, headers: NO_STORE }
      );
    }

    const noteBody = `Enquiry added manually\n\nSource: ${manualSourceLabel(source as ManualEnquirySource)}`;
    const { error: actErr } = await supabase.from("lead_activities").insert({
      lead_id: inserted.id,
      type: "note",
      payload: { body: noteBody },
      created_at: new Date().toISOString(),
    });
    if (actErr) {
      console.error("[manual lead] activity insert:", actErr);
    }

    return NextResponse.json(
      { lead: inserted as LeadRow },
      { status: 201, headers: NO_STORE }
    );
  }

  let formId: string;

  if (!requestedForm) {
    const { data: forms, error: formsErr } = await supabase
      .from("forms")
      .select("id")
      .eq("user_id", user.id)
      .order("form_name", { ascending: true })
      .limit(1);
    if (formsErr || !forms?.[0]?.id) {
      return NextResponse.json(
        { error: "Create an enquiry form first, pick Manual Entry, or choose a form below." },
        { status: 400, headers: NO_STORE }
      );
    }
    formId = forms[0].id;
  } else {
    const { data: owned, error: ownErr } = await supabase
      .from("forms")
      .select("id")
      .eq("id", requestedForm)
      .eq("user_id", user.id)
      .maybeSingle();
    if (ownErr || !owned) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404, headers: NO_STORE }
      );
    }
    formId = requestedForm;
  }

  const { data: fieldRows, error: fieldsErr } = await supabase
    .from("fields")
    .select("id, form_id, label, type, required, options")
    .eq("form_id", formId)
    .order("sort_order", { ascending: true });

  if (fieldsErr || !fieldRows?.length) {
    return NextResponse.json(
      { error: "Could not load form fields" },
      { status: 500, headers: NO_STORE }
    );
  }

  const rowsForBuild: FieldRowForManual[] = (fieldRows as FieldRowForManual[]).map(
    (r) => ({
      ...r,
      required: Boolean(r.required),
    })
  );

  const built = buildManualLeadData(rowsForBuild, formId, {
    name: body.name.trim(),
    email: emailRaw,
    phone: phoneRaw,
    message: body.message.trim(),
    source: source as ManualEnquirySource,
  });

  if (!built.ok) {
    return NextResponse.json({ error: built.error }, { status: 400, headers: NO_STORE });
  }

  const { data: inserted, error: insertErr } = await supabase
    .from("leads")
    .insert({
      form_id: formId,
      user_id: user.id,
      data: built.data,
      status,
    })
    .select("*")
    .single();

  if (insertErr || !inserted) {
    return NextResponse.json(
      { error: insertErr?.message ?? "Could not save enquiry" },
      { status: 500, headers: NO_STORE }
    );
  }

  const noteBody = `Enquiry added manually\n\nSource: ${manualSourceLabel(source as ManualEnquirySource)}`;
  const { error: actErr } = await supabase.from("lead_activities").insert({
    lead_id: inserted.id,
    type: "note",
    payload: { body: noteBody },
    created_at: new Date().toISOString(),
  });
  if (actErr) {
    console.error("[manual lead] activity insert:", actErr);
  }

  return NextResponse.json(
    { lead: inserted as LeadRow },
    { status: 201, headers: NO_STORE }
  );
}
