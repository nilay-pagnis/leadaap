import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AdminShell } from "@/components/layout/admin-shell";
import { UpgradeModalHost } from "@/components/billing/upgrade-modal-host";
import { getUsageForUser } from "@/lib/monetization/get-usage";
import { ensureProfile } from "@/lib/monetization/profile";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserIsAdmin } from "@/lib/admin/get-current-user-admin";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await ensureProfile(supabase, user.id);
  }

  let dashboardUser: {
    id: string;
    email: string;
    fullName: string | null;
  } | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    dashboardUser = {
      id: user.id,
      email: user.email ?? "",
      fullName: profile?.full_name?.trim() ?? null,
    };
  }

  const isAdmin = await getCurrentUserIsAdmin();

  if (isAdmin) {
    return <AdminShell user={dashboardUser}>{children}</AdminShell>;
  }

  const usage = user ? await getUsageForUser(user.id) : null;

  return (
    <DashboardShell showAdminNav={false} user={dashboardUser}>
      {usage && <UpgradeModalHost usage={usage} />}
      {children}
    </DashboardShell>
  );
}
