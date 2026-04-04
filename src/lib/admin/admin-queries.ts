import { createAdminClient } from "@/lib/supabase/admin";
import { resolveAndSyncProfile } from "@/lib/monetization/profile";
import { PLAN_LIMITS } from "@/lib/monetization/plans";
import type { PlanId, ProfileRow } from "@/types/billing";

export type AdminUserRow = ProfileRow & {
  email: string | null;
  leads_used: number;
  monthly_leads_used: number;
  monthly_lead_limit: number;
};

type MonthlyUsageRow = {
  user_id: string;
  monthly_leads_used: number;
  monthly_lead_limit: number;
};

const PROFILES_WITH_SUBSCRIPTIONS_SELECT = `
  id,
  email,
  created_at,
  updated_at,
  full_name,
  company_name,
  job_title,
  role,
  plan,
  credits,
  subscriptions (
    plan,
    credits,
    status
  )
`;

function pickSubscriptionFromRow(row: Record<string, unknown>): {
  plan: unknown;
  credits: unknown;
} | null {
  const raw = row.subscriptions;
  if (raw == null) return null;
  const sub = Array.isArray(raw) ? raw[0] : raw;
  if (!sub || typeof sub !== "object") return null;
  const o = sub as Record<string, unknown>;
  if (o.plan === undefined && o.credits === undefined) return null;
  return { plan: o.plan, credits: o.credits };
}

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

  let profilesRes = await admin
    .from("profiles")
    .select(PROFILES_WITH_SUBSCRIPTIONS_SELECT)
    .order("created_at", { ascending: false })
    .limit(2000);

  if (profilesRes.error) {
    profilesRes = await admin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2000);
  }

  const { data: profiles, error } = profilesRes;
  if (error || !profiles?.length) return [];

  const { data: leadRows } = await admin.from("leads").select("user_id");
  const leadCountByUser = new Map<string, number>();
  for (const r of leadRows ?? []) {
    const uid = r.user_id as string;
    leadCountByUser.set(uid, (leadCountByUser.get(uid) ?? 0) + 1);
  }

  const monthlyByUser = new Map<string, { used: number; limit: number }>();
  const { data: monthlyRows, error: monthlyErr } = await admin.rpc(
    "admin_monthly_lead_usage"
  );
  if (!monthlyErr && Array.isArray(monthlyRows)) {
    for (const row of monthlyRows as MonthlyUsageRow[]) {
      monthlyByUser.set(row.user_id, {
        used: Number(row.monthly_leads_used) || 0,
        limit: Number(row.monthly_lead_limit) || 0,
      });
    }
  }

  const rows = await Promise.all(
    (profiles as Record<string, unknown>[]).map(async (row) => {
      const p = row as unknown as ProfileRow;
      const sub = pickSubscriptionFromRow(row);
      const effective = await resolveAndSyncProfile(p.id, {
        plan: sub?.plan ?? p.plan ?? "free",
        credits: sub?.credits ?? p.credits,
      });

      const profileRow: ProfileRow = {
        id: p.id,
        plan: effective.plan,
        credits: effective.credits,
        created_at: p.created_at,
        updated_at: p.updated_at,
        full_name: p.full_name,
        company_name: p.company_name,
        job_title: p.job_title,
        role: p.role,
      };

      const profileEmail =
        typeof row.email === "string" && row.email.trim() !== ""
          ? row.email
          : null;

      return {
        ...profileRow,
        email: emailById.get(p.id) ?? profileEmail,
        leads_used: leadCountByUser.get(p.id) ?? 0,
        monthly_leads_used: monthlyByUser.get(p.id)?.used ?? 0,
        monthly_lead_limit: PLAN_LIMITS[effective.plan].creditAllocation,
      } satisfies AdminUserRow;
    })
  );

  return rows;
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
