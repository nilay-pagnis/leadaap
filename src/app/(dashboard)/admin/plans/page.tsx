import Link from "next/link";
import {
  PLAN_LIMITS,
  PLAN_PRICING,
  formatCreditsAllocationLabel,
  formatFormsLabel,
  planLabel,
} from "@/lib/monetization/plans";
import type { PlanId } from "@/types/billing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

/** Reference order for admin — matches product tiers */
const ORDER: PlanId[] = [
  "free",
  "starter",
  "growth",
  "premium",
];

export default function AdminPlansPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-primary">Admin</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Plans
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Configured limits and pricing. To change a customer&apos;s plan or
          credits, use{" "}
          <Link
            href="/admin/users"
            className="font-medium text-primary hover:underline"
          >
            Users
          </Link>
          .
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ORDER.map((id) => {
          const limits = PLAN_LIMITS[id];
          const pricing =
            id === "starter"
              ? PLAN_PRICING.starter
              : id === "growth"
                ? PLAN_PRICING.growth
                : id === "premium"
                  ? PLAN_PRICING.premium
                  : null;
          const popular = id === "growth";
          return (
            <Card
              key={id}
              className={cn(
                "relative overflow-hidden",
                popular && "ring-2 ring-primary/40"
              )}
            >
              {popular && (
                <div className="absolute right-4 top-4">
                  <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                    Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{planLabel(id)}</CardTitle>
                {pricing && (
                  <p className="text-2xl font-semibold tabular-nums text-foreground">
                    ₹{pricing.priceInr.toLocaleString("en-IN")}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{pricing.period}
                    </span>
                  </p>
                )}
                {id === "free" && (
                  <p className="text-sm text-muted-foreground">
                    Default entry tier for all new workspaces.
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    Forms:{" "}
                    <span className="text-foreground">
                      {formatFormsLabel(limits.maxForms)}
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    Lead credits / period:{" "}
                    <span className="text-foreground">
                      {formatCreditsAllocationLabel(limits.creditAllocation)}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Link
        href="/admin/users"
        className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}
      >
        Open user management
      </Link>
    </div>
  );
}
