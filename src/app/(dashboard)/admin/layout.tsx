import { redirect } from "next/navigation";
import { getCurrentUserIsAdmin } from "@/lib/admin/get-current-user-admin";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await getCurrentUserIsAdmin())) {
    redirect("/dashboard");
  }
  return <>{children}</>;
}
