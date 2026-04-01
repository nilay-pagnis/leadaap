"use client";

import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LeadRow } from "@/types";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  CreditCard,
  FileText,
  Inbox,
  LayoutGrid,
  Rocket,
  Share2,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";

type Props = {
  totalLeads: number;
  newLeads: number;
  leadsToday: number;
  conversionRatePct: number | null;
  formCount: number;
  firstFormId: string | null;
  recent: LeadRow[];
  formNames: Record<string, string>;
};

const StatCard = memo(function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  delay = 0,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -2 }}
      className="h-full"
    >
      <div className="glass-card group relative h-full overflow-hidden rounded-2xl p-5 transition-shadow duration-300 hover:shadow-[0_12px_40px_-16px_rgba(79,70,229,0.15)]">
        <div className="mb-3 flex items-start justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </span>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-[18px]" aria-hidden />
          </div>
        </div>
        <p className="text-3xl font-semibold tabular-nums tracking-tight text-slate-900 sm:text-4xl">
          {value}
        </p>
        {hint && <p className="mt-2 text-sm text-slate-500">{hint}</p>}
      </div>
    </motion.div>
  );
});

export function DashboardExperience({
  totalLeads,
  newLeads,
  leadsToday,
  conversionRatePct,
  formCount,
  firstFormId,
  recent,
  formNames,
}: Props) {
  const insight =
    leadsToday === 0
      ? "No new leads yet today — share a form link to fill your pipeline."
      : `${leadsToday} new lead${leadsToday === 1 ? "" : "s"} arrived today.`;

  return (
    <div className="space-y-10 lg:space-y-12">
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium text-primary">Welcome back</p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Your pipeline at a glance
            </h1>
            <p className="max-w-xl text-sm text-slate-600 sm:text-base">{insight}</p>
            {newLeads > 0 && (
              <p className="text-sm text-slate-500">
                <span className="font-medium text-slate-700">{newLeads}</span> still new in
                inbox
              </p>
            )}
          </div>
          {formCount > 0 && firstFormId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex min-w-0 flex-wrap gap-2"
            >
              <Link
                href={`/f/${firstFormId}`}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "min-w-0 border-slate-200"
                )}
              >
                <Share2 className="mr-2 size-4 shrink-0 text-primary" />
                <span className="truncate">Open public form</span>
              </Link>
              <Link href="/forms" className={cn(buttonVariants({ size: "sm" }), "min-w-0")}>
                <span className="truncate">Manage forms</span>
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {formCount === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] to-white p-6 sm:p-8"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                <Sparkles className="size-6 text-primary" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-slate-900">Create your first form</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Publish a capture flow and start collecting leads in minutes.
                </p>
              </div>
            </div>
            <Link
              href="/onboarding"
              className={cn(buttonVariants({ size: "lg" }), "w-full shrink-0 sm:w-auto")}
            >
              Start setup
            </Link>
          </div>
        </motion.div>
      )}

      {formCount > 0 && totalLeads === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-3 rounded-2xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-950"
        >
          <Bell className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p className="min-w-0 break-words">
            <span className="font-medium">Tip:</span> share your form link — most teams see the
            first lead within a few days.
          </p>
        </motion.div>
      )}

      <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
        <StatCard label="Total leads" value={totalLeads} icon={Inbox} delay={0} />
        <StatCard
          label="Conversion rate"
          value={conversionRatePct != null ? `${conversionRatePct}%` : "—"}
          hint={
            conversionRatePct != null
              ? "Contacted or closed vs. all leads"
              : "Leads will appear here"
          }
          icon={BarChart3}
          delay={0.05}
        />
        <StatCard
          label="Active forms"
          value={formCount}
          hint="Published capture flows"
          icon={LayoutGrid}
          delay={0.1}
        />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-slate-200/90 bg-gradient-to-r from-primary/[0.06] via-white to-violet-50/50 p-6 sm:p-8"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Rocket className="size-6" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Scale with Growth</h2>
              <p className="mt-1 max-w-md text-sm text-slate-600">
                Higher lead limits, unlimited forms, and room to grow.
              </p>
            </div>
          </div>
          <Link href="/dashboard/billing" className={cn(buttonVariants({ size: "lg" }), "shrink-0")}>
            View plans
          </Link>
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <Card className="border-slate-200/90 lg:col-span-2">
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="min-w-0 space-y-1">
              <CardTitle>Recent activity</CardTitle>
              <p className="text-sm text-slate-500">Latest submissions</p>
            </div>
            <Link
              href="/leads"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "shrink-0 text-primary"
              )}
            >
              View all
              <ArrowUpRight className="ml-1 size-4 shrink-0" />
            </Link>
          </CardHeader>
          <CardContent className="pt-2">
            {recent.length === 0 ? (
              <div className="py-14 text-center sm:py-16">
                <TrendingUp className="mx-auto size-10 text-slate-300" />
                <p className="mt-4 font-medium text-slate-800">No submissions yet</p>
                <p className="mt-2 text-sm text-slate-500">
                  Submissions appear here as soon as they arrive.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100 hover:bg-transparent">
                      <TableHead className="text-slate-500">Form</TableHead>
                      <TableHead className="text-slate-500">Preview</TableHead>
                      <TableHead className="text-slate-500">Status</TableHead>
                      <TableHead className="text-right text-slate-500">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recent.map((row) => {
                      const preview = Object.values(row.data ?? {})
                        .filter((v) => typeof v === "string" && v)
                        .slice(0, 2)
                        .join(" · ");
                      return (
                        <TableRow key={row.id} className="border-slate-100">
                          <TableCell className="max-w-[140px] font-medium text-slate-900">
                            <span className="line-clamp-2 break-words">
                              {formNames[row.form_id] ?? "—"}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[min(200px,40vw)] truncate text-slate-500">
                            {preview || "—"}
                          </TableCell>
                          <TableCell>
                            <LeadStatusBadge status={row.status} />
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums text-slate-500">
                            {new Date(row.created_at).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <p className="text-sm text-slate-500">Shortcuts</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link
              href="/forms"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "h-11 w-full min-w-0 justify-start"
              )}
            >
              <FileText className="mr-2 size-4 shrink-0 text-primary" />
              <span className="truncate">Forms</span>
            </Link>
            <Link
              href="/leads"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "h-11 w-full min-w-0 justify-start"
              )}
            >
              <TrendingUp className="mr-2 size-4 shrink-0 text-primary" />
              <span className="truncate">Leads</span>
            </Link>
            <Link
              href="/dashboard/billing"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "h-11 w-full min-w-0 justify-start"
              )}
            >
              <CreditCard className="mr-2 size-4 shrink-0 text-primary" />
              <span className="truncate">Billing</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
