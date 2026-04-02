"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SiteLogo } from "@/components/brand/site-logo";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

const navItems = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#use-cases", label: "Use cases" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

const primaryCtaClass = cn(
  buttonVariants({ size: "sm" }),
  "marketing-cta-primary rounded-xl text-white shadow-md"
);

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/85 py-2 pt-[max(0.5rem,env(safe-area-inset-top,0px))] backdrop-blur-md"
      role="banner"
    >
      <div className="mx-auto flex min-h-[3.75rem] max-w-[1200px] items-center justify-between gap-4 px-4 sm:min-h-[4.25rem] sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 flex-col gap-0.5 sm:gap-1"
          aria-label="Enquireo home"
        >
          <SiteLogo variant="full" priority className="min-w-0" />
          <span className="text-[10px] font-medium tracking-wide text-zinc-500 sm:text-[11px]">
            Capture. Qualify. Convert.
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Primary"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:gap-3 lg:flex">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "rounded-xl text-zinc-600"
            )}
          >
            Log in
          </Link>
          <Link href="/signup" className={primaryCtaClass}>
            Get Started
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/signup"
            className={cn(primaryCtaClass, "inline-flex shrink-0 px-3 text-xs sm:px-4 sm:text-sm")}
          >
            Get Started
          </Link>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-800 shadow-sm lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div
          id="mobile-nav"
          className="border-t border-zinc-200/80 bg-white px-4 py-4 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile primary">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="rounded-xl px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              onClick={() => setMobileOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className={cn(primaryCtaClass, "mt-2 justify-center")}
              onClick={() => setMobileOpen(false)}
            >
              Get Started
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
