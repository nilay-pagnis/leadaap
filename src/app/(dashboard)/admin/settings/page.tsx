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
    .select("full_name, company_name, job_title")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <SettingsClient
      email={user.email ?? ""}
      initial={{
        fullName: profile?.full_name?.trim() ?? "",
        companyName: profile?.company_name?.trim() ?? "",
        jobTitle: profile?.job_title?.trim() ?? "",
      }}
    />
  );
}
