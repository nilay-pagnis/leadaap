import { createAdminClient } from "@/lib/supabase/admin";
import { resolveAndSyncProfile } from "@/lib/monetization/profile";
import { PLAN_LIMITS } from "@/lib/monetization/plans";
import type { PlanId, ProfileRow } from "@/types/billing";

export type AdminUserRow = ProfileRow & {
  email: string | null;
  /** All-time leads tied to this user's forms (same scope as billing `getUsageForUser`). */
  leads_used: number;
  monthly_leads_used: number;
  monthly_lead_limit: number;
  /** Plan monthly enquiry allocation (same as billing lead cap). */
  lead_cap: number;
  /** Same formula as billing: max(0, lead_cap - leads_used). */
  credits_remaining: number;
};

type MonthlyUsageRow = {
  user_id: string;
  monthly_leads_used: number;
  monthly_lead_limit: number;
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
 * Count leads across all of a user's forms — matches `getUsageForUser` / billing page.
 */
function buildBillingLeadsUsedByUserId(
  forms: { id: string; user_id: string }[],
  leads: { form_id: string }[]
): Map<string, number> {
  const formIdsByUser = new Map<string, string[]>();
  for (const f of forms) {
    const list = formIdsByUser.get(f.user_id) ?? [];
    list.push(f.id);
    formIdsByUser.set(f.user_id, list);
  }
  const countByForm = new Map<string, number>();
  for (const l of leads) {
    const fid = l.form_id;
    countByForm.set(fid, (countByForm.get(fid) ?? 0) + 1);
  }
  const byUser = new Map<string, number>();
  formIdsByUser.forEach((ids, userId) => {
    let n = 0;
    for (let i = 0; i < ids.length; i++) {
      n += countByForm.get(ids[i]!) ?? 0;
    }
    byUser.set(userId, n);
  });
  return byUser;
}

/**
 * Loads profiles merged with auth emails (service role). Call only from server after admin check.
 *
 * Plan and stored credits come from `public.profiles` only (billing single source of truth).
 * Lead usage and “remaining” match the in-app billing snapshot (`getUsageForUser`).
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

  const [{ data: formRows }, { data: leadRows }] = await Promise.all([
    admin.from("forms").select("id, user_id"),
    admin.from("leads").select("form_id"),
  ]);

  const billingLeadsByUser = buildBillingLeadsUsedByUserId(
    (formRows ?? []) as { id: string; user_id: string }[],
    (leadRows ?? []) as { form_id: string }[]
  );

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

      const effective = await resolveAndSyncProfile(p.id, {
        plan: p.plan ?? "free",
        credits: p.credits,
      });

      const leadCap = PLAN_LIMITS[effective.plan].creditAllocation;
      const leadsUsed = billingLeadsByUser.get(p.id) ?? 0;
      const creditsRemaining = Math.max(0, leadCap - leadsUsed);

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
        leads_used: leadsUsed,
        monthly_leads_used: monthlyByUser.get(p.id)?.used ?? 0,
        monthly_lead_limit: PLAN_LIMITS[effective.plan].creditAllocation,
        lead_cap: leadCap,
        credits_remaining: creditsRemaining,
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
