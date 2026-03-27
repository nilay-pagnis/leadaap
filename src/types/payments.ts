import type { PaidPlan } from "@/lib/payments/plan-paid";

export type PaymentStatus = "pending" | "approved" | "rejected";

export type PaymentRow = {
  id: string;
  user_id: string;
  email: string;
  plan: PaidPlan;
  amount_inr: number;
  payment_id: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
};
