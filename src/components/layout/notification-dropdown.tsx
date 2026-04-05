"use client";

import { useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightLeft,
  Bell,
  BellRing,
  FileText,
  Inbox,
  UserPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardTooltip } from "@/components/layout/dashboard-tooltip";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";
import { useRelativeTimeTicker } from "@/hooks/use-relative-time-ticker";
import { ClientRelativeTime } from "@/components/ui/client-relative-time";

function iconForType(type: string) {
  if (type === "lead_received") return UserPlus;
  if (type === "follow_up") return BellRing;
  if (type === "lead_status_changed") return ArrowRightLeft;
  if (type.includes("form")) return FileText;
  return Bell;
}

export function NotificationDropdown({
  userId,
  className,
}: {
  userId: string | null;
  className?: string;
}) {
  const titleId = useId();
  const router = useRouter();
  const { items, loading, error, unreadCount, markRead, markAllRead } =
    useNotifications(userId);
  const timeTick = useRelativeTimeTicker(true);
  const badgeText =
    unreadCount > 9 ? "9+" : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <DropdownMenu>
      <DashboardTooltip label="Notifications">
        <DropdownMenuTrigger
          className={cn(
            "relative inline-flex size-9 shrink-0 items-center justify-center rounded-full text-slate-600 outline-none transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-slate-400/50 active:scale-[0.97] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:focus-visible:ring-slate-600 data-[state=open]:bg-slate-100 data-[state=open]:shadow-sm dark:data-[state=open]:bg-slate-800",
            className
          )}
          aria-label="Notifications"
          aria-describedby={titleId}
        >
          <Bell className="size-[18px]" aria-hidden />
          {badgeText ? (
            <span
              className="absolute -right-0.5 -top-0.5 flex min-w-[1.125rem] items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-white dark:bg-indigo-500 dark:ring-slate-950"
              aria-hidden
            >
              {badgeText}
            </span>
          ) : null}
          <span className="sr-only">
            Notifications
            {unreadCount > 0 ? `, ${unreadCount} unread` : ""}
          </span>
        </DropdownMenuTrigger>
      </DashboardTooltip>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[min(100vw-2rem,22rem)] rounded-2xl p-0 shadow-lg shadow-slate-900/8 ring-1 ring-slate-200/80 dark:shadow-none dark:ring-slate-800"
      >
        <div
          className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2.5 dark:border-slate-800"
          id={titleId}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Notifications
          </p>
          {unreadCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 rounded-lg px-2 text-[11px] font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void markAllRead();
              }}
            >
              Mark all read
            </Button>
          ) : null}
        </div>

        {error ? (
          <p className="px-3 py-6 text-center text-xs text-red-600 dark:text-red-400">
            {error.includes("relation") || error.includes("does not exist")
              ? "Run the notifications migration in Supabase (see supabase/notifications.sql)."
              : error}
          </p>
        ) : loading ? (
          <div className="space-y-2 px-3 py-4">
            <div className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />
            <div className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <Inbox className="size-10 text-slate-200 dark:text-slate-700" aria-hidden />
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">You&apos;re all caught up</p>
            <p className="text-xs text-slate-500">New enquiries will notify you here in real time.</p>
            <Link
              href="/inbox"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl")}
            >
              Open leads
            </Link>
          </div>
        ) : (
          <ul className="max-h-[min(60vh,340px)] overflow-y-auto p-1.5" role="list">
            <AnimatePresence initial={false}>
              {items.map((n, i) => {
                const Icon = iconForType(n.type);
                const unread = n.read_at == null;
                return (
                  <motion.li
                    key={n.id}
                    initial={{ opacity: 0, x: 4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.18 }}
                    className="list-none"
                  >
                    <button
                      type="button"
                      className={cn(
                        "group flex w-full gap-3 rounded-xl px-2.5 py-2.5 text-left transition-all duration-200 hover:bg-slate-50 active:scale-[0.99] dark:hover:bg-slate-900/80",
                        unread && "bg-indigo-50/50 dark:bg-indigo-950/20"
                      )}
                      onClick={() => {
                        if (unread) void markRead(n.id);
                        if (n.link) router.push(n.link);
                      }}
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 transition-colors group-hover:bg-slate-200/80 dark:bg-slate-800 dark:group-hover:bg-slate-700/80">
                        <Icon className="size-4 text-slate-600 dark:text-slate-300" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{n.title}</p>
                        {n.body ? (
                          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.body}</p>
                        ) : null}
                        <ClientRelativeTime
                          iso={n.created_at}
                          className="mt-1 block text-[11px] tabular-nums text-slate-400"
                          tick={timeTick}
                          variant="relative"
                        />
                      </div>
                      {unread ? (
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-indigo-500" aria-hidden />
                      ) : null}
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
        <div className="border-t border-slate-100 px-3 py-2 text-center dark:border-slate-800">
          <Link
            href="/inbox"
            className="text-[11px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            View all activity in Leads
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
