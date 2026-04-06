import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PLAN_PRICING } from "@/lib/monetization/plans";
import type { PaidPlan } from "@/lib/payments/plan-paid";

export const runtime = "nodejs";

const PAY_ID_RE = /^pay_[A-Za-z0-9]+$/;

const PAID_PLANS: PaidPlan[] = ["starter", "growth", "premium"];

type Body = {
  plan?: string;
  paymentId?: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const planRaw = body.plan;
  if (
    typeof planRaw !== "string" ||
    !PAID_PLANS.includes(planRaw as PaidPlan)
  ) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
  const plan = planRaw as PaidPlan;

  const rawId = typeof body.paymentId === "string" ? body.paymentId.trim() : "";
  if (!rawId || !PAY_ID_RE.test(rawId)) {
    return NextResponse.json(
      {
        error:
          "Enter a valid Razorpay Payment ID (starts with pay_, from your receipt or Razorpay dashboard).",
      },
      { status: 400 }
    );
  }

  const amountInr = PLAN_PRICING[plan].priceInr;
  const email = user.email ?? "";

  const { error } = await supabase.from("payments").insert({
    user_id: user.id,
    email,
    plan,
    amount_inr: amountInr,
    payment_id: rawId,
    status: "pending",
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "This Payment ID was already submitted." },
        { status: 409 }
      );
    }
    console.error("[api/payments/submit] insert", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.info("[api/payments/submit] pending row created", {
    userId: user.id,
    plan,
  });

  return NextResponse.json({ ok: true });
}
