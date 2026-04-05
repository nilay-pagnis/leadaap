import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLeadShortLabelFromData } from "@/lib/leads/lead-display";
import { leadStatusLabel } from "@/lib/leads/lead-status-label";
import type { LeadStatus } from "@/types";

export const dynamic = "force-dynamic";

const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
} as const;

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "closed"];

function isLeadStatus(v: unknown): v is LeadStatus {
  return typeof v === "string" && STATUSES.includes(v as LeadStatus);
}

/**
 * Creates an in-app notification after the authenticated user updates a lead status.
 * Uses service role insert (matches submit-lead / cron pattern).
 */
export async function POST(request: Request) {
  let body: {
    leadId?: unknown;
    fromStatus?: unknown;
    toStatus?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400, headers: NO_STORE }
    );
  }

  const leadId = typeof body.leadId === "string" ? body.leadId.trim() : "";
  if (!leadId || !isLeadStatus(body.fromStatus) || !isLeadStatus(body.toStatus)) {
    return NextResponse.json(
      { error: "leadId, fromStatus, and toStatus are required" },
      { status: 400, headers: NO_STORE }
    );
  }

  const fromStatus = body.fromStatus;
  const toStatus = body.toStatus;
  if (fromStatus === toStatus) {
    return NextResponse.json({ ok: true, skipped: true }, { headers: NO_STORE });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }

  const { data: lead, error: leadErr } = await supabase
    .from("leads")
    .select("id, user_id, data")
    .eq("id", leadId)
    .maybeSingle();

  if (leadErr || !lead) {
    return NextResponse.json(
      { error: "Lead not found" },
      { status: 404, headers: NO_STORE }
    );
  }

  if ((lead as { user_id: string }).user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: NO_STORE });
  }

  const data = (lead as { data: Record<string, unknown> }).data;
  const nameHint = getLeadShortLabelFromData(data);

  try {
    const admin = createAdminClient();
    const { error: insErr } = await admin.from("notifications").insert({
      user_id: user.id,
      type: "lead_status_changed",
      title: `Status updated: ${nameHint}`,
      body: `${leadStatusLabel(fromStatus)} → ${leadStatusLabel(toStatus)}`,
      link: `/inbox?lead=${leadId}`,
      metadata: {
        lead_id: leadId,
        from_status: fromStatus,
        to_status: toStatus,
      },
    });

    if (insErr) {
      console.error("[notifications/lead-status] insert", insErr);
      return NextResponse.json(
        { error: insErr.message },
        { status: 500, headers: NO_STORE }
      );
    }
  } catch (e) {
    console.error("[notifications/lead-status]", e);
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 503, headers: NO_STORE }
    );
  }

  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
