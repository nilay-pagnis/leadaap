"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  Menu,
  CreditCard,
  BookOpen,
  ClipboardCheck,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useUiStore } from "@/stores/ui-store";
import { SiteLogo } from "@/components/brand/site-logo";
import { LightCanvas } from "@/components/layout/light-canvas";
import { DashboardPageMotion } from "@/components/layout/dashboard-page-motion";
import { TopNavbar, type DashboardUser } from "@/components/layout/top-navbar";
import { CommandPaletteProvider } from "@/components/command-palette/command-palette";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/forms", label: "Forms", icon: FileText },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

function navActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/dashboard/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function pageTitle(pathname: string): string {
  if (pathname.startsWith("/dashboard/billing/confirm")) return "Payment";
  if (pathname.startsWith("/dashboard/billing")) return "Billing";
  if (pathname.startsWith("/dashboard/settings")) return "Settings";
  if (pathname.startsWith("/forms/")) return "Form";
  if (pathname === "/forms" || pathname.startsWith("/forms?")) return "Forms";
  if (pathname === "/leads" || pathname.startsWith("/leads?")) return "Leads";
  if (pathname === "/dashboard" || pathname === "/dashboard/") return "Dashboard";
  return "Workspace";
}

export function DashboardShell({
  children,
  showAdminNav = false,
  user = null,
}: {
  children: React.ReactNode;
  showAdminNav?: boolean;
  user?: DashboardUser | null;
}) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const mobileOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileOpen = useUiStore((s) => s.setMobileNavOpen);
  const headerActions = useUiStore((s) => s.dashboardHeaderActions);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const title = pageTitle(pathname);

  return (
    <CommandPaletteProvider userId={user?.id ?? null}>
    <div className="relative min-h-dvh overflow-x-hidden bg-[#F8FAFC] text-foreground dark:bg-background">
      <LightCanvas />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-dvh max-h-dvh w-[min(260px,85vw)] flex-col border-r border-slate-200/70 bg-white/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md transition-transform duration-300 ease-out lg:w-[260px] lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-100 px-5">
          <SiteLogo size="sm" className="shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-slate-900">LeadApp</p>
            <p className="text-xs font-medium text-slate-500">Workspace</p>
          </div>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-3" aria-label="Main">
          {nav.map((item) => {
            const active = navActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <motion.div key={item.href} whileHover={{ x: 2 }} transition={{ duration: 0.18 }}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className="size-[18px] shrink-0 opacity-90" aria-hidden />
                  <span className="truncate">{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>
        <div className="shrink-0 space-y-0.5 border-t border-slate-100 p-3">
          {showAdminNav && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-50"
            >
              <ClipboardCheck className="size-4 shrink-0" aria-hidden />
              Admin
            </Link>
          )}
          <Link
            href="/docs"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <BookOpen className="size-4 shrink-0" aria-hidden />
            Developer docs
          </Link>
        </div>
        <div className="shrink-0 border-t border-slate-100 p-4">
          <Button
            variant="ghost"
            className="w-full min-w-0 justify-start gap-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            onClick={() => void signOut()}
          >
            <LogOut className="size-4 shrink-0" />
            <span className="truncate">Sign out</span>
          </Button>
        </div>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-slate-900/15 backdrop-blur-[1px] transition-opacity lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="relative z-10 min-w-0 lg:pl-[260px]">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/75 dark:border-slate-800/80 dark:bg-background/90 dark:supports-[backdrop-filter]:bg-background/75">
          <div className="pt-[env(safe-area-inset-top,0px)]">
            <div className="flex h-14 min-w-0 items-center justify-between gap-2 px-4 lg:h-[3.75rem] lg:gap-3 lg:px-6">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 rounded-full text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="size-5" />
                </Button>
                <h1 className="min-w-0 truncate text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100 lg:text-lg">
                  {title}
                </h1>
              </div>
              <TopNavbar headerActions={headerActions} user={user} />
            </div>
          </div>
        </header>
        <main className="relative z-10 min-w-0 overflow-x-hidden pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] pt-6 lg:pb-12 lg:pt-8">
          <DashboardPageMotion>
            <PageContainer className="space-y-8">{children}</PageContainer>
          </DashboardPageMotion>
        </main>
      </div>
    </div>
    </CommandPaletteProvider>
  );
}
