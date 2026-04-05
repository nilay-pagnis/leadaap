import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLeadShortLabelFromData } from "@/lib/leads/lead-display";

export const dynamic = "force-dynamic";

function authorize(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

async function runFollowUpCron(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const nowIso = new Date().toISOString();

  try {
    const admin = createAdminClient();

    const { data: due, error: selErr } = await admin
      .from("follow_ups")
      .select("id, user_id, lead_id, remind_at, note")
      .eq("status", "pending")
      .lte("remind_at", nowIso);

    if (selErr) {
      return NextResponse.json({ error: selErr.message }, { status: 500 });
    }

    const rows = due ?? [];
    if (rows.length === 0) {
      return NextResponse.json({ ok: true, processed: 0 });
    }

    const leadIds = Array.from(new Set(rows.map((r) => r.lead_id)));
    const { data: leads, error: leadsErr } = await admin
      .from("leads")
      .select("id, data")
      .in("id", leadIds);

    if (leadsErr) {
      return NextResponse.json({ error: leadsErr.message }, { status: 500 });
    }

    const leadMap = new Map(
      (leads ?? []).map((l) => [l.id as string, l.data as Record<string, unknown>])
    );

    let processed = 0;
    for (const row of rows) {
      const data = leadMap.get(row.lead_id);
      const label = getLeadShortLabelFromData(data);
      const bodyNote =
        typeof row.note === "string" && row.note.trim()
          ? row.note.trim().slice(0, 200)
          : "Your reminder is due — open the enquiry to continue.";

      const { error: notifErr } = await admin.from("notifications").insert({
        user_id: row.user_id,
        type: "follow_up",
        title: `Follow up: ${label}`,
        body: bodyNote,
        link: `/inbox?lead=${row.lead_id}`,
        metadata: { lead_id: row.lead_id, follow_up_id: row.id },
      });

      if (notifErr) {
        console.error("[cron/follow-ups] notification insert", notifErr);
        continue;
      }

      const { error: updErr } = await admin
        .from("follow_ups")
        .update({
          status: "notified",
          notified_at: nowIso,
        })
        .eq("id", row.id)
        .eq("status", "pending");

      if (updErr) {
        console.error("[cron/follow-ups] follow_up update", updErr);
        continue;
      }
      processed += 1;
    }

    return NextResponse.json({ ok: true, processed, found: rows.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Vercel Cron invokes GET; POST supported for manual / pg_cron triggers. */
export async function GET(req: Request) {
  return runFollowUpCron(req);
}

export async function POST(req: Request) {
  return runFollowUpCron(req);
}
