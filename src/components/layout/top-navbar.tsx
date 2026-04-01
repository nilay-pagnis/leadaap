"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { DashboardTooltip } from "@/components/layout/dashboard-tooltip";
import { useCommandPalette } from "@/components/command-palette/command-palette";
import { cn } from "@/lib/utils";

export type DashboardUser = {
  id: string;
  email: string;
  fullName: string | null;
};

/**
 * Right-side dashboard utilities: optional page actions, theme, notifications, profile.
 */
export function TopNavbar({
  headerActions,
  user,
  className,
}: {
  headerActions: ReactNode;
  user: DashboardUser | null;
  className?: string;
}) {
  const { setOpen } = useCommandPalette();

  return (
    <div
      className={cn(
        "flex min-w-0 shrink-0 items-center gap-1 sm:gap-1.5",
        className
      )}
    >
      {headerActions ? (
        <div className="mr-1 flex min-w-0 flex-wrap items-center justify-end gap-2 sm:mr-2">
          {headerActions}
        </div>
      ) : null}
      <div className="flex items-center gap-0.5 rounded-full border border-transparent p-0.5 sm:gap-1">
        <DashboardTooltip label="Search & commands (⌘K)">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={cn(
              "inline-flex size-9 shrink-0 items-center justify-center rounded-full text-slate-600 outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400/50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:focus-visible:ring-slate-600"
            )}
            aria-label="Open command palette"
          >
            <Search className="size-[18px]" aria-hidden />
          </button>
        </DashboardTooltip>
        <ThemeToggle />
        <NotificationDropdown userId={user?.id ?? null} />
        <ProfileMenu
          email={user?.email ?? ""}
          fullName={user?.fullName ?? null}
        />
      </div>
    </div>
  );
}
