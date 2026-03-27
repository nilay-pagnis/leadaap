import { redirect } from "next/navigation";

/** @deprecated Use /dashboard/billing */
export default function BillingPageRedirect() {
  redirect("/dashboard/billing");
}
