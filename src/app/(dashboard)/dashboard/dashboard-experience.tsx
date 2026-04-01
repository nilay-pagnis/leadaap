"use client";

import { memo, useMemo } from "react";
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
  FileText,
  Inbox,
  LayoutGrid,
  Share2,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { SiteLogo } from "@/components/brand/site-logo";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { LeadsChart } from "@/components/dashboard/leads-chart";

type Props = {
  totalLeads: number;
  newLeads: number;
  leadsToday: number;
  leadsWeek: number;
  conversionRatePct: number | null;
  formCount: number;
  firstFormId: string | null;
  recent: LeadRow[];
  formNames: Record<string, string>;
  chartSeries: { iso: string; label: string; count: number }[];
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="h-full"
    >
      <div className="group h-full rounded-2xl border border-slate-200/80 bg-white p-5 transition-colors duration-200 hover:border-slate-300/90 hover:bg-slate-50/40">
        <div className="mb-3 flex items-start justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </span>
          <div className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-slate-200/80">
            <Icon className="size-[17px]" aria-hidden />
          </div>
        </div>
        <p className="text-2xl font-semibold tabular-nums tracking-tight text-slate-900 sm:text-3xl">
          {value}
        </p>
        {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
      </div>
    </motion.div>
  );
});

function InsightCard({
  totalLeads,
  newLeads,
  leadsToday,
  leadsWeek,
  formCount,
}: {
  totalLeads: number;
  newLeads: number;
  leadsToday: number;
  leadsWeek: number;
  formCount: number;
}) {
  const text = useMemo(() => {
    if (formCount === 0) {
      return "Create a form to get a shareable link — submissions route straight to this workspace.";
    }
    if (totalLeads === 0) {
      return "No submissions yet. Share your public link on your site, bio, or campaigns to start filling the chart.";
    }
    if (leadsToday > 0) {
      return `${leadsToday} new lead${leadsToday === 1 ? "" : "s"} today — prioritize follow-up while intent is fresh.`;
    }
    if (newLeads >= 4) {
      return `${newLeads} leads are still marked new. Batch a reply session to clear the queue faster.`;
    }
    if (leadsWeek > 0) {
      return `${leadsWeek} lead${leadsWeek === 1 ? "" : "s"} in the last 7 days. Keep routing responses to “Contacted” as you work them.`;
    }
    return "Pipeline is quiet — refresh copy on your form or promote the link in one new channel this week.";
  }, [formCount, totalLeads, leadsToday, newLeads, leadsWeek]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="flex h-full flex-col rounded-2xl border border-indigo-200/50 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/40 p-5 sm:p-6"
    >
      <div className="flex items-center gap-2 text-indigo-700">
        <Sparkles className="size-4 shrink-0" aria-hidden />
        <span className="text-[11px] font-bold uppercase tracking-wider">Insight</span>
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-700">{text}</p>
      <Link
        href="/leads"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "mt-4 -ml-2 w-fit gap-1 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
        )}
      >
        Open inbox
        <ArrowUpRight className="size-4" />
      </Link>
    </motion.div>
  );
}

export function DashboardExperience({
  totalLeads,
  newLeads,
  leadsToday,
  leadsWeek,
  conversionRatePct,
  formCount,
  firstFormId,
  recent,
  formNames,
  chartSeries,
}: Props) {
  return (
    <div className="space-y-8 lg:space-y-10">
      {formCount > 0 && firstFormId && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href={`/f/${firstFormId}`}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "min-w-0 rounded-xl border-slate-200 bg-white"
            )}
          >
            <Share2 className="mr-2 size-4 shrink-0 text-slate-600" />
            <span className="truncate">Public form link</span>
          </Link>
          <Link href="/forms" className={cn(buttonVariants({ size: "sm" }), "min-w-0 rounded-xl")}>
            <span className="truncate">Manage forms</span>
          </Link>
        </div>
      )}

      {formCount === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 gap-4">
              <SiteLogo size="md" className="shrink-0" />
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-slate-900">Create your first form</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Publish a capture flow — leads land in your inbox automatically.
                </p>
              </div>
            </div>
            <Link href="/onboarding" className={cn(buttonVariants({ size: "lg" }), "w-full shrink-0 sm:w-auto")}>
              Start setup
            </Link>
          </div>
        </motion.div>
      )}

      {formCount > 0 && totalLeads === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950"
        >
          <Bell className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p className="min-w-0 break-words">
            <span className="font-medium">Tip:</span> share your form link — most teams see the first lead within a few days.
          </p>
        </motion.div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total leads" value={totalLeads} icon={Inbox} delay={0} />
        <StatCard
          label="New"
          value={newLeads}
          hint="Awaiting first touch"
          icon={TrendingUp}
          delay={0.03}
        />
        <StatCard
          label="Active forms"
          value={formCount}
          hint="Published flows"
          icon={LayoutGrid}
          delay={0.06}
        />
        <StatCard
          label="Conversion"
          value={conversionRatePct != null ? `${conversionRatePct}%` : "—"}
          hint={
            conversionRatePct != null ? "Moved past “New” vs. all" : "No leads to measure yet"
          }
          icon={BarChart3}
          delay={0.09}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <Card className="border-slate-200/90 lg:col-span-8">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-semibold">Leads over time</CardTitle>
            <p className="text-sm font-normal text-slate-500">Daily submissions (last 14 days)</p>
          </CardHeader>
          <CardContent className="pt-6">
            <LeadsChart series={chartSeries} />
          </CardContent>
        </Card>

        <div className="lg:col-span-4">
          <InsightCard
            totalLeads={totalLeads}
            newLeads={newLeads}
            leadsToday={leadsToday}
            leadsWeek={leadsWeek}
            formCount={formCount}
          />
        </div>
      </div>

      <Card className="border-slate-200/90">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base font-semibold">Recent activity</CardTitle>
            <p className="text-sm text-slate-500">Latest submissions</p>
          </div>
          <Link
            href="/leads"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "shrink-0 rounded-xl text-slate-700 hover:bg-slate-100"
            )}
          >
            View all
            <ArrowUpRight className="ml-1 size-4 shrink-0" />
          </Link>
        </CardHeader>
        <CardContent className="pt-2">
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center sm:py-16">
              <FileText className="size-10 text-slate-200" aria-hidden />
              <p className="mt-4 font-medium text-slate-800">No submissions yet</p>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                When someone fills a form, it will show up here instantly.
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
                          <span className="line-clamp-2 break-words">{formNames[row.form_id] ?? "—"}</span>
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
    </div>
  );
}
