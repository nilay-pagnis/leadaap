import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AdminShell } from "@/components/layout/admin-shell";
import { UsageBanner } from "@/components/billing/usage-banner";
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

  const isAdmin = await getCurrentUserIsAdmin();

  if (isAdmin) {
    return <AdminShell>{children}</AdminShell>;
  }

  const usage = user ? await getUsageForUser(user.id) : null;

  return (
    <DashboardShell showAdminNav={false}>
      {usage && <UsageBanner usage={usage} />}
      {usage && <UpgradeModalHost usage={usage} />}
      {children}
    </DashboardShell>
  );
}
