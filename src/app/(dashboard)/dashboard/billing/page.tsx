import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUsageForUser } from "@/lib/monetization/get-usage";
import { BillingClient } from "./billing-client";

export default async function DashboardBillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const usage = await getUsageForUser(user.id);

  const { data: pendingRows, error: pendingErr } = await supabase
    .from("payments")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .limit(1);

  const hasPendingPayment =
    !pendingErr && (pendingRows?.length ?? 0) > 0;

  const { data: paymentRows } = await supabase
    .from("payments")
    .select("id, plan, amount_inr, payment_id, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(40);

  return (
    <BillingClient
      usage={usage}
      hasPendingPayment={hasPendingPayment}
      payments={(paymentRows ?? []) as {
        id: string;
        plan: string;
        amount_inr: number;
        payment_id: string;
        status: string;
        created_at: string;
      }[]}
    />
  );
}
