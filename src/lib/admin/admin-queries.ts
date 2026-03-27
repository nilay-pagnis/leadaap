import { createAdminClient } from "@/lib/supabase/admin";
import type { PlanId, ProfileRow } from "@/types/billing";

export type AdminUserRow = ProfileRow & {
  email: string | null;
  leads_used: number;
};

async function loadAuthEmailsByUserId(
  admin: ReturnType<typeof createAdminClient>
): Promise<Map<string, string>> {
  const emailById = new Map<string, string>();
  try {
    let page = 1;
    const perPage = 1000;
    for (;;) {
      const { data, error } = await admin.auth.admin.listUsers({
        page,
        perPage,
      });
      if (error || !data?.users?.length) break;
      for (const u of data.users) {
        emailById.set(u.id, u.email ?? "");
      }
      if (data.users.length < perPage) break;
      page += 1;
      if (page > 20) break;
    }
  } catch {
    /* service role auth admin API unavailable */
  }
  return emailById;
}

/**
 * Loads profiles merged with auth emails (service role). Call only from server after admin check.
 */
export async function fetchAdminUsersList(): Promise<AdminUserRow[]> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return [];
  }

  const emailById = await loadAuthEmailsByUserId(admin);

  const { data: profiles, error } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(2000);

  if (error || !profiles?.length) return [];

  const { data: leadRows } = await admin.from("leads").select("user_id");
  const leadCountByUser = new Map<string, number>();
  for (const r of leadRows ?? []) {
    const uid = r.user_id as string;
    leadCountByUser.set(uid, (leadCountByUser.get(uid) ?? 0) + 1);
  }

  return (profiles as ProfileRow[]).map((p) => ({
    ...p,
    email: emailById.get(p.id) ?? null,
    leads_used: leadCountByUser.get(p.id) ?? 0,
  }));
}

export type AdminStats = {
  users: number;
  forms: number;
  leads: number;
  paymentsPending: number;
};

export async function fetchAdminStats(): Promise<AdminStats> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return {
      users: 0,
      forms: 0,
      leads: 0,
      paymentsPending: 0,
    };
  }

  const [users, forms, leads, pending] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("forms").select("*", { count: "exact", head: true }),
    admin.from("leads").select("*", { count: "exact", head: true }),
    admin
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return {
    users: users.count ?? 0,
    forms: forms.count ?? 0,
    leads: leads.count ?? 0,
    paymentsPending: pending.count ?? 0,
  };
}

export type AdminDashboardStats = {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenueInr: number;
  leadsProcessed: number;
};

export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return {
      totalUsers: 0,
      activeSubscriptions: 0,
      totalRevenueInr: 0,
      leadsProcessed: 0,
    };
  }

  const paidPlans: PlanId[] = ["starter", "growth", "premium"];

  const [usersRes, subsRes, revenueRows, leadsRes] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .in("plan", paidPlans),
    admin.from("payments").select("amount_inr").eq("status", "approved"),
    admin.from("leads").select("*", { count: "exact", head: true }),
  ]);

  const totalRevenueInr = (revenueRows.data ?? []).reduce(
    (acc, r: { amount_inr: number }) => acc + (Number(r.amount_inr) || 0),
    0
  );

  return {
    totalUsers: usersRes.count ?? 0,
    activeSubscriptions: subsRes.count ?? 0,
    totalRevenueInr,
    leadsProcessed: leadsRes.count ?? 0,
  };
}
