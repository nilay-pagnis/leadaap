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
  MessageSquare,
  Share2,
  Sparkles,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { SiteLogo } from "@/components/brand/site-logo";
import { EnquiryFormSourceLine } from "@/components/leads/enquiry-form-source-line";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { DashboardInboxVolume } from "@/components/dashboard/dashboard-inbox-volume";
import { ClientRelativeTime } from "@/components/ui/client-relative-time";
import { useRelativeTimeTicker } from "@/hooks/use-relative-time-ticker";

type Props = {
  userId: string;
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="h-full"
    >
      <div className="glass-card-light group relative h-full overflow-hidden p-5 shadow-premium transition-shadow duration-300 hover:shadow-premium-hover dark:border-white/10 dark:bg-zinc-950/50 dark:shadow-soft dark:hover:shadow-soft-lg">
        <div
          className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-gradient-to-br from-indigo-400/15 via-violet-400/10 to-transparent blur-2xl"
          aria-hidden
        />
        <div className="relative mb-3 flex items-start justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            {label}
          </span>
          <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/12 to-violet-500/10 text-indigo-700 shadow-inner ring-1 ring-indigo-500/10 transition-transform duration-300 group-hover:scale-105 dark:from-indigo-400/20 dark:to-violet-500/15 dark:text-indigo-200">
            <Icon className="size-[18px]" aria-hidden />
          </div>
        </div>
        <p className="relative text-2xl font-semibold tabular-nums tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
          {value}
        </p>
        {hint ? (
          <p className="relative mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        ) : null}
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
      return "I don’t see any live forms yet — create one to get a shareable link. Submissions will land in your inbox automatically.";
    }
    if (totalLeads === 0) {
      return "Your pipeline is ready. Share the public link on your site, email footer, or social bio — most teams see the first enquiry within a few days.";
    }
    if (leadsToday > 0) {
      return `Today you’ve had ${leadsToday} new submission${leadsToday === 1 ? "" : "s"}. Intent decays fast — I’d prioritize a first touch while they still remember you.`;
    }
    if (newLeads >= 4) {
      return `${newLeads} enquiries are still “New”. A focused reply block (even 20 minutes) usually clears the mental load and improves conversion.`;
    }
    if (leadsWeek > 0) {
      return `${leadsWeek} in the last 7 days — healthy flow. Move wins to “Contacted” as you go so your dashboard stays an honest picture of what’s left.`;
    }
    return "Quiet week — try a small experiment: refresh your form headline or promote the link in one new channel.";
  }, [formCount, totalLeads, leadsToday, newLeads, leadsWeek]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="ai-insight-shimmer relative flex h-full flex-col overflow-hidden rounded-2xl border border-indigo-200/40 bg-white/75 p-5 shadow-premium backdrop-blur-xl sm:p-6 dark:border-indigo-500/20 dark:bg-zinc-950/55 dark:shadow-soft"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/[0.04] via-transparent to-violet-500/[0.06]"
        aria-hidden
      />
      <div className="relative flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
        <motion.span
          animate={{ rotate: [0, 8, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="size-4 shrink-0" aria-hidden />
        </motion.span>
        <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
          Workspace insight
        </span>
      </div>
      <p className="relative mt-3 flex-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
        {text}
      </p>
      <Link
        href="/inbox"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "relative mt-4 -ml-2 w-fit gap-1 rounded-xl font-medium text-indigo-700 hover:bg-indigo-500/10 hover:text-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-500/15 dark:hover:text-indigo-200"
        )}
      >
        Open smart inbox
        <ArrowUpRight className="size-4" />
      </Link>
    </motion.div>
  );
}

function ActionInsightChips({
  newLeads,
  formCount,
  firstFormId,
  totalLeads,
}: {
  newLeads: number;
  formCount: number;
  firstFormId: string | null;
  totalLeads: number;
}) {
  const chips = useMemo(() => {
    const c: {
      key: string;
      href: string;
      label: string;
      sub: string;
      icon: LucideIcon;
    }[] = [];
    if (newLeads > 0) {
      c.push({
        key: "new",
        href: "/inbox",
        label: "Follow up",
        sub: `${newLeads} awaiting first touch`,
        icon: Zap,
      });
    } else if (totalLeads > 0) {
      c.push({
        key: "inbox",
        href: "/inbox",
        label: "Review inbox",
        sub: "Sorted by lead score",
        icon: MessageSquare,
      });
    }
    if (formCount > 0 && firstFormId) {
      c.push({
        key: "share",
        href: `/f/${firstFormId}`,
        label: "Share form",
        sub: "Copy-ready public link",
        icon: Share2,
      });
    }
    return c.slice(0, 3);
  }, [newLeads, formCount, firstFormId, totalLeads]);

  if (chips.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 }}
      className="grid gap-3 sm:grid-cols-3"
    >
      {chips.map((c, i) => (
        <motion.div
          key={c.key}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.05 }}
        >
          <Link
            href={c.href}
            target={c.key === "share" ? "_blank" : undefined}
            rel={c.key === "share" ? "noreferrer" : undefined}
            className="group flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/65 p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-indigo-200/80 hover:bg-white/90 hover:shadow-premium dark:border-white/10 dark:bg-zinc-950/40 dark:hover:border-indigo-500/30 dark:hover:bg-zinc-950/60"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-slate-700 ring-1 ring-slate-200/80 transition-transform duration-300 group-hover:scale-105 group-hover:from-indigo-500/15 group-hover:to-violet-500/10 group-hover:text-indigo-700 dark:from-zinc-800 dark:to-zinc-900 dark:text-slate-200 dark:ring-white/10">
              <c.icon className="size-[18px]" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                {c.label}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                {c.sub}
              </span>
            </span>
            <ArrowUpRight className="ml-auto size-4 shrink-0 text-slate-300 transition-colors group-hover:text-indigo-500 dark:text-slate-600" />
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function DashboardExperience({
  userId,
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
  const timeTick = useRelativeTimeTicker(true, 30_000);

  return (
    <div className="space-y-6 lg:space-y-8">
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
            <span className="truncate">Public enquiry form link</span>
          </Link>
          <Link href="/forms" className={cn(buttonVariants({ size: "sm" }), "min-w-0 rounded-xl")}>
            <span className="truncate">Manage enquiry forms</span>
          </Link>
        </div>
      )}

      {formCount === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-premium backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-zinc-950/50"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 gap-4">
              <SiteLogo size="md" className="shrink-0" />
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-slate-900">Create your first enquiry form</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Publish a capture flow — enquiries land in your inbox automatically.
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
            <span className="font-medium">Tip:</span> share your form link — most teams see the first enquiry within a few days.
          </p>
        </motion.div>
      )}

      <ActionInsightChips
        newLeads={newLeads}
        formCount={formCount}
        firstFormId={firstFormId}
        totalLeads={totalLeads}
      />

      {newLeads > 0 && formCount > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-3 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/[0.07] to-violet-500/[0.06] px-4 py-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-primary/35 dark:from-primary/15 dark:to-violet-500/10"
        >
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            <span className="font-semibold tabular-nums">{newLeads} new</span> in your inbox — a
            quick triage pass now usually beats chasing cold leads later.
          </p>
          <Link
            href="/inbox"
            className={cn(
              buttonVariants({ size: "sm" }),
              "shrink-0 rounded-xl font-semibold shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.99]"
            )}
          >
            Triage inbox
            <ArrowUpRight className="ml-1 size-4 shrink-0" />
          </Link>
        </motion.div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Inbox total" value={totalLeads} icon={Inbox} delay={0} />
        <StatCard
          label="New"
          value={newLeads}
          hint="Awaiting first touch"
          icon={TrendingUp}
          delay={0.03}
        />
        <StatCard
          label="Active enquiry forms"
          value={formCount}
          hint="Published flows"
          icon={LayoutGrid}
          delay={0.06}
        />
        <StatCard
          label="Conversion"
          value={conversionRatePct != null ? `${conversionRatePct}%` : "—"}
          hint={
            conversionRatePct != null ? "Moved past “New” vs. all" : "No enquiries to measure yet"
          }
          icon={BarChart3}
          delay={0.09}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <Card className="border-slate-200/70 bg-white/75 shadow-premium backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/45 lg:col-span-8">
          <CardHeader className="border-b border-slate-100/80 pb-4 dark:border-white/10">
            <CardTitle className="text-base font-semibold tracking-tight">
              Inbox volume
            </CardTitle>
            <p className="text-sm font-normal text-slate-500 dark:text-slate-400">
              Daily submissions to your workspace (last 14 days, UTC days). Updates live when new
              enquiries arrive.
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <DashboardInboxVolume userId={userId} initialSeries={chartSeries} />
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

      <Card className="border-slate-200/70 bg-white/75 shadow-premium backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/45">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 border-b border-slate-100/80 pb-4 dark:border-white/10">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base font-semibold tracking-tight">
              Recent activity
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">Latest submissions</p>
          </div>
          <Link
            href="/inbox"
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
                When someone submits your enquiry form, it will show up here instantly.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="text-slate-500">Enquiry form</TableHead>
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
                        <TableCell className="max-w-[min(200px,40vw)]">
                          <EnquiryFormSourceLine
                            lead={row}
                            formNames={formNames}
                            titleClassName="line-clamp-2 break-words"
                          />
                        </TableCell>
                        <TableCell className="max-w-[min(200px,40vw)] truncate text-slate-500">
                          {preview || "—"}
                        </TableCell>
                        <TableCell>
                          <LeadStatusBadge status={row.status} />
                        </TableCell>
                        <TableCell className="text-right text-sm text-slate-500">
                          <ClientRelativeTime
                            iso={row.created_at}
                            tick={timeTick}
                            absoluteTitle
                            className="tabular-nums"
                          />
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
