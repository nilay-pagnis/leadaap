"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  formatCreditsAllocationLabel,
  formatFormsLabel,
  formatFormsUsageLine,
  formatLeadsUsageLine,
  isUnlimitedCredits,
  isUnlimitedForms,
  PLAN_LIMITS,
  PLAN_PRICING,
  planLabel,
  progressBarClassForBand,
} from "@/lib/monetization/plans";
import type { UsageSnapshot } from "@/lib/monetization/get-usage";
import type { UpgradeModalReason } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { SiteLogo } from "@/components/brand/site-logo";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usage: UsageSnapshot;
  reason?: UpgradeModalReason | null;
};

function headline(reason: UpgradeModalReason | null | undefined): {
  title: string;
  description: string;
} {
  switch (reason) {
    case "form_limit":
      return {
        title: "Room for more capture pages",
        description:
          "You’ve used every form slot on your current plan. Upgrade to publish more funnels and keep growth on track.",
      };
    case "lead_limit":
      return {
        title: "Scale your pipeline",
        description:
          "You’ve reached your enquiry allocation for this plan. Move up a tier to keep every submission flowing into Enquireo.",
      };
    case "inbox_features":
      return {
        title: "Unlock the full inbox",
        description:
          "Paid plans include drag-and-drop on the pipeline board, custom column order, numeric lead scores with full breakdowns — plus higher monthly enquiry limits and more forms.",
      };
    case "session_nudge":
      return {
        title: "You’re at capacity",
        description:
          "A quick plan bump unlocks more forms and lead credits — stay focused on growth, not limits.",
      };
    default:
      return {
        title: "Grow with the right plan",
        description:
          "Compare tiers below. Upgrade anytime for more forms, more lead credits, and a workspace that scales with you.",
      };
  }
}

const PLAN_CARDS: {
  key: "starter" | "growth" | "premium";
  blurb: string;
  featured?: boolean;
}[] = [
  {
    key: "starter",
    blurb: "Solid start for solo operators and first campaigns.",
  },
  {
    key: "growth",
    blurb: "More forms and credits — our pick for teams that are scaling.",
    featured: true,
  },
  {
    key: "premium",
    blurb: "Unlimited enquiry forms and unlimited monthly credits for peak volume.",
  },
];

export function UpgradeModal({
  open,
  onOpenChange,
  usage,
  reason,
}: Props) {
  const { title, description } = headline(reason);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,720px)] max-w-lg overflow-y-auto rounded-2xl border-slate-200 bg-white p-0 shadow-xl">
        <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white px-6 pb-5 pt-6">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex items-center gap-2">
              <SiteLogo size="xs" className="rounded-xl shadow-sm" />
              <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900">
                {title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm leading-relaxed text-slate-600">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Your workspace
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {planLabel(usage.plan)} plan
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {formatLeadsUsageLine(usage.leadsUsed, usage.leadCap)}
              {!isUnlimitedCredits(usage.leadCap) && (
                <>
                  {" "}
                  (
                  <span className="tabular-nums font-medium text-slate-800">
                    {usage.leadUsagePct}%
                  </span>
                  )
                </>
              )}
            </p>
            {!isUnlimitedCredits(usage.leadCap) && (
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    progressBarClassForBand(usage.leadBand)
                  )}
                  style={{ width: `${Math.min(100, usage.leadUsagePct)}%` }}
                />
              </div>
            )}
            {!isUnlimitedForms(usage.maxForms) && (
              <>
                <p className="mt-3 text-sm text-slate-600">
                  {formatFormsUsageLine(usage.formCount, usage.maxForms)} (
                  <span className="tabular-nums font-medium text-slate-800">
                    {usage.formUsagePct}%
                  </span>
                  )
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      progressBarClassForBand(usage.formBand)
                    )}
                    style={{ width: `${Math.min(100, usage.formUsagePct)}%` }}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3 px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Paid plans
          </p>
          <div className="grid gap-3">
            {PLAN_CARDS.map(({ key, blurb, featured }) => {
              const limits = PLAN_LIMITS[key];
              const price = PLAN_PRICING[key];
              return (
                <div
                  key={key}
                  className={cn(
                    "relative rounded-xl border p-4 transition-shadow",
                    featured
                      ? "border-primary/40 bg-gradient-to-br from-primary/[0.06] to-white shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] ring-2 ring-primary/20"
                      : "border-slate-200 bg-slate-50/50"
                  )}
                >
                  {featured && (
                    <span className="absolute right-3 top-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                      Best value
                    </span>
                  )}
                  <p className="text-sm font-semibold text-slate-900">
                    {price.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
                    ₹{price.priceInr.toLocaleString("en-IN")}
                    <span className="text-sm font-normal text-slate-500">
                      /mo
                    </span>
                  </p>
                  <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                    <li className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {formatFormsLabel(limits.maxForms)} forms
                    </li>
                    <li className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {formatCreditsAllocationLabel(limits.creditAllocation)}{" "}
                      lead credits / month
                    </li>
                    <li className="flex gap-2 text-slate-500">
                      <Check className="mt-0.5 size-4 shrink-0 text-slate-400" />
                      {blurb}
                    </li>
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            className="rounded-xl border-slate-200"
            onClick={() => onOpenChange(false)}
          >
            Maybe later
          </Button>
          <Link
            href="/dashboard/billing"
            onClick={() => onOpenChange(false)}
            className={cn(buttonVariants(), "rounded-xl shadow-sm")}
          >
            Upgrade now
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
