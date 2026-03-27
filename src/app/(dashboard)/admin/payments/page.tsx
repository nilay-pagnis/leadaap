import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserIsAdmin } from "@/lib/admin/get-current-user-admin";
import { AdminPaymentsClient } from "./admin-payments-client";
import type { PaymentRow } from "@/types/payments";

export default async function AdminPaymentsPage() {
  if (!(await getCurrentUserIsAdmin())) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  const initialPayments: PaymentRow[] =
    !error && data ? (data as PaymentRow[]) : [];

  return <AdminPaymentsClient initialPayments={initialPayments} />;
}
