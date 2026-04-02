"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  formatFormsUsageLine,
  formatLeadsUsageLine,
  isUnlimitedForms,
  planLabel,
  progressBarClassForBand,
  type UsageBand,
} from "@/lib/monetization/plans";
import type { UsageSnapshot } from "@/lib/monetization/get-usage";
import { AlertTriangle, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";

type Props = {
  usage: UsageSnapshot;
  className?: string;
};

function bandMessage(worst: UsageBand, atLimit: boolean): string | null {
  if (atLimit || worst === "limit") {
    return "You’re at a plan limit — upgrade to keep capturing enquiries and publishing enquiry forms without interruption.";
  }
  if (worst === "strong") {
    return "You’re in the top 10% of your allocation. Upgrade soon so growth never hits a ceiling.";
  }
  if (worst === "soft") {
    return "You’ve passed 70% of a limit — plenty of runway, and a higher tier gives you peace of mind.";
  }
  return null;
}

export function UsageBanner({ usage, className }: Props) {
  const pathname = usePathname() ?? "";
  const onDashboardHome = pathname === "/dashboard" || pathname === "/dashboard/";

  const worst = usage.worstBand;
  const atLimit = usage.atLeadLimit || usage.atFormLimit;
  const nudge = bandMessage(worst, atLimit);

  const leadPct = usage.leadUsagePct;
  const formPct = usage.formUsagePct;

  const iconWrap = cn(
    "flex size-10 shrink-0 items-center justify-center rounded-xl",
    atLimit && "bg-red-100 text-red-700",
    !atLimit && worst === "strong" && "bg-orange-100 text-orange-800",
    !atLimit && worst === "soft" && "bg-amber-100 text-amber-800",
    !atLimit && worst === "ok" && "bg-primary/15 text-primary"
  );

  const cardBorder = cn(
    atLimit && "border-red-200",
    !atLimit && worst === "strong" && "border-orange-200",
    !atLimit && worst === "soft" && "border-amber-200",
    !atLimit && worst === "ok" && "border-slate-200/90"
  );

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)] transition-colors sm:p-6",
        cardBorder,
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className={iconWrap}>
            {atLimit || worst === "strong" ? (
              <AlertTriangle className="size-5" aria-hidden />
            ) : (
              <Sparkles className="size-5" aria-hidden />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              <span className="truncate">{planLabel(usage.plan)} plan</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatLeadsUsageLine(usage.leadsUsed, usage.leadCap)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatFormsUsageLine(usage.formCount, usage.maxForms)}
              {" · "}
              <span className="tabular-nums">{usage.creditsRemaining}</span>{" "}
              credits remaining
            </p>
            {usage.usedFallback && (
              <p className="mt-2 text-xs text-amber-800 dark:text-amber-200/90">
                Using default limits — reconnect billing when possible.
              </p>
            )}
            {nudge && (
              <p
                className={cn(
                  "mt-2 text-sm leading-relaxed",
                  atLimit && "text-red-800 dark:text-red-200/95",
                  !atLimit && worst === "strong" && "text-orange-900/90",
                  !atLimit && worst === "soft" && "text-amber-900/90",
                  !atLimit && worst === "ok" && "text-slate-600"
                )}
              >
                {nudge}
              </p>
            )}
            {!atLimit &&
              worst === "ok" &&
              usage.creditsRemaining <= 2 &&
              usage.leadCap > 0 && (
                <p className="mt-2 text-xs text-slate-600">
                  Only {usage.creditsRemaining} enquiry credit
                  {usage.creditsRemaining === 1 ? "" : "s"} left this cycle — add
                  capacity anytime from Billing.
                </p>
              )}
            {!onDashboardHome && atLimit && (
              <p className="mt-2 text-xs text-slate-600">
                <Link
                  href="/dashboard/billing"
                  className="font-medium text-primary hover:underline"
                >
                  Open billing to upgrade
                </Link>
              </p>
            )}
          </div>
        </div>
        <Link
          href="/dashboard/billing"
          className={cn(
            buttonVariants(),
            "w-full shrink-0 justify-center shadow-sm sm:w-auto"
          )}
        >
          {atLimit ? "Upgrade now" : "View plans"}
        </Link>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Enquiry usage</span>
          <span className="tabular-nums">{leadPct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              progressBarClassForBand(usage.leadBand)
            )}
            style={{ width: `${leadPct}%` }}
          />
        </div>
        {!isUnlimitedForms(usage.maxForms) && (
          <>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Enquiry form slots</span>
              <span className="tabular-nums">{formPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  progressBarClassForBand(usage.formBand)
                )}
                style={{ width: `${formPct}%` }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
