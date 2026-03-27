export type PlanId =
  | "free"
  | "trial"
  | "starter"
  | "growth"
  | "premium"
  | "enterprise";

export interface ProfileRow {
  id: string;
  plan: PlanId;
  credits: number;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
  full_name?: string | null;
  company_name?: string | null;
  job_title?: string | null;
  /** Application role: `user` or `admin` (set in DB only). */
  role?: string | null;
}
