"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Layers,
  Settings,
  LogOut,
  Menu,
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

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/plans", label: "Plans", icon: Layers },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function navActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin" || pathname === "/admin/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const mobileOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileOpen = useUiStore((s) => s.setMobileNavOpen);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const sectionLabel =
    nav.find((n) => navActive(pathname, n.href))?.label ?? "Admin";

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#F8FAFC] text-foreground">
      <LightCanvas />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-dvh max-h-dvh w-[min(260px,85vw)] flex-col border-r border-slate-200/90 bg-white/95 pb-[env(safe-area-inset-bottom,0px)] shadow-[1px_0_0_rgba(15,23,42,0.04)] backdrop-blur-xl transition-transform duration-300 ease-out lg:w-[260px] lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-100 px-5">
          <SiteLogo size="sm" className="shadow-sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-slate-900">
              LeadAap
            </p>
            <p className="text-xs font-medium text-slate-500">Admin</p>
          </div>
        </div>
        <nav
          className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-3"
          aria-label="Admin"
        >
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
                      ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/15"
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
        <div className="shrink-0 border-t border-slate-100 p-4">
          <Button
            variant="ghost"
            className="w-full min-w-0 justify-start gap-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
          className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-[2px] transition-opacity lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="relative z-10 min-w-0 lg:pl-[260px]">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
          <div className="pt-[env(safe-area-inset-top,0px)]">
            <div className="flex h-14 min-w-0 items-center justify-between px-4 lg:h-16 lg:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-slate-700 hover:bg-slate-100 lg:hidden"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="size-5" />
                </Button>
                <p className="truncate text-sm font-medium text-slate-500">{sectionLabel}</p>
              </div>
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
  );
}
