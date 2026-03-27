"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PLAN_PRICING } from "@/lib/monetization/plans";
import type { PaidPlan } from "@/lib/payments/plan-paid";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function PaymentConfirmClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlan = useMemo((): PaidPlan => {
    const p = searchParams.get("plan");
    if (p === "starter" || p === "growth" || p === "premium") return p;
    return "growth";
  }, [searchParams]);

  const [plan, setPlan] = useState<PaidPlan>(initialPlan);
  const [paymentId, setPaymentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // If user came here after paying (redirect/back), recover plan from localStorage.
  // Query param still takes priority.
  useEffect(() => {
    const fromQuery = searchParams.get("plan");
    if (fromQuery === "starter" || fromQuery === "growth" || fromQuery === "premium") {
      setPlan(fromQuery);
      return;
    }
    try {
      const stored = localStorage.getItem("leadaap:selectedPlan");
      if (stored === "starter" || stored === "growth" || stored === "premium") {
        setPlan(stored);
      }
    } catch {
      // ignore
    }
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/payments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, paymentId: paymentId.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(
          typeof data.error === "string" ? data.error : "Could not save payment"
        );
        return;
      }
      setSubmitted(true);
      toast.success("Payment submitted — pending verification");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const price = PLAN_PRICING[plan].priceInr;

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <p className="text-sm font-medium text-blue-600">Billing</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          Confirm your payment
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          After paying through the Razorpay payment page, copy the{" "}
          <strong>Payment ID</strong> (starts with{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
            pay_
          </code>
          ) from the success screen, your email receipt, or the Razorpay dashboard.
        </p>
      </div>

      <Card className="border-gray-200 shadow-sm dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg">Submit payment proof</CardTitle>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
                Thanks — your submission is <strong>pending</strong>. We’ll verify
                it against Razorpay and upgrade your workspace. This usually
                happens within one business day.
              </p>
              <p className="text-gray-500">
                You can return to billing anytime to check your plan status.
              </p>
              <Link
                href="/dashboard/billing"
                className={cn(buttonVariants(), "w-full sm:w-auto")}
              >
                Back to billing
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan">Plan you paid for</Label>
                <Select
                  value={plan}
                  onValueChange={(v) => setPlan(v as PaidPlan)}
                >
                  <SelectTrigger id="plan" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">
                      {PLAN_PRICING.starter.label} — ₹{PLAN_PRICING.starter.priceInr}
                      /mo
                    </SelectItem>
                    <SelectItem value="growth">
                      {PLAN_PRICING.growth.label} — ₹{PLAN_PRICING.growth.priceInr}
                      /mo
                    </SelectItem>
                  <SelectItem value="premium">
                    {PLAN_PRICING.premium.label} — ₹{PLAN_PRICING.premium.priceInr}
                    /mo
                  </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Expected amount for this selection:{" "}
                  <span className="font-medium tabular-nums">₹{price}</span>
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentId">Razorpay Payment ID</Label>
                <Input
                  id="paymentId"
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                  placeholder="pay_xxxxxxxxxxxx"
                  autoComplete="off"
                  spellCheck={false}
                  required
                  className="font-mono text-sm"
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Verify Payment"
                )}
              </Button>
              <p className="text-xs text-gray-500">
                We verify each ID manually. You’ll see your plan change to{" "}
                <strong>approved</strong> after we confirm with Razorpay.
              </p>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-sm text-gray-500">
        <Link
          href="/dashboard/billing"
          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to billing
        </Link>
      </p>
    </div>
  );
}
