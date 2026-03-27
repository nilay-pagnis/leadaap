import { fetchAdminUsersList } from "@/lib/admin/admin-queries";
import { AdminUsersClient } from "./admin-users-client";

export default async function AdminUsersPage() {
  const users = await fetchAdminUsersList();
  return <AdminUsersClient initialUsers={users} />;
}
