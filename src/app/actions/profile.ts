"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CompleteProfileResult =
  | { ok: true }
  | { ok: false; error: string };

export async function completeProfileAction(input: {
  fullName: string;
  companyName?: string;
  jobTitle?: string;
}): Promise<CompleteProfileResult> {
  const fullName = input.fullName.trim();
  if (!fullName) {
    return { ok: false, error: "Please enter your full name." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const company = input.companyName?.trim() ?? "";
  const job = input.jobTitle?.trim() ?? "";

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      company_name: company || null,
      job_title: job || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

const WHATSAPP_TIERS = new Set(["hot", "warm_hot", "all"]);

export type WhatsAppLeadAlertsResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateWhatsAppLeadAlertsAction(input: {
  enabled: boolean;
  tier: string;
  phone: string;
}): Promise<WhatsAppLeadAlertsResult> {
  const tier = input.tier.trim();
  if (!WHATSAPP_TIERS.has(tier)) {
    return { ok: false, error: "Invalid alert option." };
  }
  const phone = input.phone.trim();
  const digits = phone.replace(/\D/g, "");
  if (input.enabled && digits.length < 10) {
    return {
      ok: false,
      error:
        "Enter your WhatsApp number with country code (e.g. 9198xxxxxxxx or +91 …).",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase
    .from("profiles")
    .update({
      whatsapp_alerts_enabled: input.enabled,
      whatsapp_alerts_tier: tier,
      whatsapp_alert_phone: digits.length > 0 ? phone : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/", "layout");
  return { ok: true };
}
