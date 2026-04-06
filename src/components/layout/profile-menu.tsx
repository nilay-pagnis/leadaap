"use client";

import { useRouter } from "next/navigation";
import { CreditCard, LogOut, Settings, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardTooltip } from "@/components/layout/dashboard-tooltip";
import { cn } from "@/lib/utils";

function getInitials(fullName: string | null | undefined, email: string) {
  const n = fullName?.trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  }
  const local = email.split("@")[0] ?? "?";
  return local.slice(0, 2).toUpperCase();
}

export function ProfileMenu({
  email,
  fullName,
  className,
}: {
  email: string;
  fullName?: string | null;
  className?: string;
}) {
  const router = useRouter();
  const initials = getInitials(fullName, email);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DashboardTooltip label="Account menu">
        <DropdownMenuTrigger
          className={cn(
            "relative inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-xs font-semibold text-slate-800 outline-none ring-2 ring-white transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-slate-400/60 dark:from-slate-600 dark:to-slate-700 dark:text-slate-100 dark:ring-slate-950 dark:focus-visible:ring-slate-500",
            className
          )}
          aria-label="Open profile menu"
        >
          <span aria-hidden>{initials || "?"}</span>
        </DropdownMenuTrigger>
      </DashboardTooltip>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-[12rem] rounded-2xl p-1.5 shadow-md ring-1 ring-slate-200/80 dark:ring-slate-800"
      >
        <div className="px-2 py-2">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
            {fullName?.trim() || "Your account"}
          </p>
          <p className="truncate text-xs text-slate-500">{email || "—"}</p>
        </div>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem
          onClick={() => router.push("/dashboard/settings#profile")}
          className="cursor-pointer gap-2 rounded-lg"
        >
          <User className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/dashboard/settings")}
          className="cursor-pointer gap-2 rounded-lg"
        >
          <Settings className="size-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/dashboard/billing")}
          className="cursor-pointer gap-2 rounded-lg"
        >
          <CreditCard className="size-4" />
          Billing
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => void signOut()}
          className="cursor-pointer gap-2 rounded-lg"
        >
          <LogOut className="size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
