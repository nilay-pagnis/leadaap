import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "@/app/(dashboard)/dashboard/settings/settings-client";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, company_name, job_title, whatsapp_alerts_enabled, whatsapp_alerts_tier, whatsapp_alert_phone"
    )
    .eq("id", user.id)
    .maybeSingle();

  const p = profile as {
    full_name?: string | null;
    company_name?: string | null;
    job_title?: string | null;
    whatsapp_alerts_enabled?: boolean | null;
    whatsapp_alerts_tier?: string | null;
    whatsapp_alert_phone?: string | null;
  } | null;

  return (
    <SettingsClient
      email={user.email ?? ""}
      initial={{
        fullName: p?.full_name?.trim() ?? "",
        companyName: p?.company_name?.trim() ?? "",
        jobTitle: p?.job_title?.trim() ?? "",
        whatsappAlertsEnabled: Boolean(p?.whatsapp_alerts_enabled),
        whatsappAlertsTier:
          p?.whatsapp_alerts_tier === "warm_hot" || p?.whatsapp_alerts_tier === "all"
            ? p.whatsapp_alerts_tier
            : "hot",
        whatsappAlertPhone: p?.whatsapp_alert_phone?.trim() ?? "",
      }}
    />
  );
}
