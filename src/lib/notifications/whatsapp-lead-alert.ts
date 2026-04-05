import { createAdminClient } from "@/lib/supabase/admin";
import { calculateLeadScore, type LeadScoreLabel } from "@/lib/leads/lead-score";
import {
  getLeadNameAndEmail,
  getLeadPhoneNumber,
} from "@/lib/leads/lead-display";
import type { LeadFieldDef, LeadRow } from "@/types";

export type WhatsAppAlertsTier = "hot" | "warm_hot" | "all";

function headlineForLabel(label: LeadScoreLabel): string {
  if (label === "Hot") return "🔥 New Hot Lead";
  if (label === "Warm") return "⚡ New Warm Lead";
  return "📋 New enquiry";
}

function passesTierFilter(label: LeadScoreLabel, tier: string): boolean {
  switch (tier as WhatsAppAlertsTier) {
    case "hot":
      return label === "Hot";
    case "warm_hot":
      return label === "Hot" || label === "Warm";
    case "all":
      return true;
    default:
      return label === "Hot";
  }
}

function serviceLabel(
  lead: LeadRow,
  formNames: Record<string, string>
): string {
  if (lead.form_id) {
    const n = formNames[lead.form_id]?.trim();
    return n || "Enquiry form";
  }
  const src = lead.data?.source;
  if (typeof src === "string" && src.trim()) return src.trim();
  return "Manual entry";
}

function ownerPhoneToWhatsAppTo(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return `whatsapp:+${digits}`;
}

function inboxLeadUrl(leadId: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    process.env.VERCEL_URL?.replace(/^(?!https?:)/, "https://") ||
    "";
  if (!base) return `/inbox?lead=${leadId}`;
  return `${base}/inbox?lead=${leadId}`;
}

function buildAlertBody(input: {
  label: LeadScoreLabel;
  name: string;
  service: string;
  score: number;
  phone: string;
  email: string;
  link: string;
}): string {
  const { label, name, service, score, phone, email, link } = input;
  const head = headlineForLabel(label);
  const phoneLine = phone.trim() || "—";
  const emailLine = email.trim() && email !== "—" ? email.trim() : "—";
  return `${head}

Name: ${name}
Service: ${service}
Score: ${score} (${label})

📞 ${phoneLine}
📩 ${emailLine}

👉 Open: ${link}`;
}

async function sendTwilioWhatsApp(toWhatsapp: string, body: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  let from = process.env.TWILIO_WHATSAPP_FROM?.trim() ?? "";
  if (!sid || !token || !from) {
    console.warn(
      "[whatsapp-lead-alert] Twilio env missing (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM); skip send"
    );
    return;
  }
  if (!from.startsWith("whatsapp:")) {
    from = from.startsWith("+")
      ? `whatsapp:${from}`
      : `whatsapp:+${from.replace(/\D/g, "")}`;
  }
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const params = new URLSearchParams({
    To: toWhatsapp,
    From: from,
    Body: body,
  });
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    console.error("[whatsapp-lead-alert] Twilio HTTP", res.status, text);
  }
}

type ProfileAlertRow = {
  whatsapp_alerts_enabled: boolean | null;
  whatsapp_alerts_tier: string | null;
  whatsapp_alert_phone: string | null;
};

/**
 * After a new lead is stored, notify the workspace owner on WhatsApp if enabled and score matches tier.
 * Never throws to callers; logs Twilio / DB errors.
 */
export async function maybeSendLeadWhatsAppAlert(params: {
  lead: LeadRow;
  ownerUserId: string;
  formNames: Record<string, string>;
  fieldDefs: LeadFieldDef[];
}): Promise<void> {
  const { lead, ownerUserId, formNames, fieldDefs } = params;
  try {
    const admin = createAdminClient();
    const { data: profile, error } = await admin
      .from("profiles")
      .select(
        "whatsapp_alerts_enabled, whatsapp_alerts_tier, whatsapp_alert_phone"
      )
      .eq("id", ownerUserId)
      .maybeSingle();

    if (error || !profile) {
      if (error) console.error("[whatsapp-lead-alert] profile load", error);
      return;
    }

    const p = profile as ProfileAlertRow;
    if (!p.whatsapp_alerts_enabled) return;

    const rawPhone = p.whatsapp_alert_phone?.trim() ?? "";
    const toAddr = ownerPhoneToWhatsAppTo(rawPhone);
    if (!toAddr) return;

    const tier = p.whatsapp_alerts_tier?.trim() || "hot";
    const scoreResult = calculateLeadScore({ lead, formNames, fieldDefs });
    if (!passesTierFilter(scoreResult.label, tier)) return;

    const { name, email } = getLeadNameAndEmail(lead, fieldDefs);
    const phone = getLeadPhoneNumber(lead, fieldDefs);
    const displayName = name !== "—" ? name : "Unknown";
    const link = inboxLeadUrl(lead.id);
    const body = buildAlertBody({
      label: scoreResult.label,
      name: displayName,
      service: serviceLabel(lead, formNames),
      score: scoreResult.score,
      phone,
      email: email !== "—" ? email : "",
      link,
    });

    await sendTwilioWhatsApp(toAddr, body);
  } catch (e) {
    console.error("[whatsapp-lead-alert] unhandled", e);
  }
}
