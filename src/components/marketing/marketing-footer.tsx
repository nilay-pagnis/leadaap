"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

const trialFormId = process.env.NEXT_PUBLIC_TRIAL_FORM_ID;

function defaultStartFreeHref() {
  return trialFormId && trialFormId.length > 8
    ? `/f/${trialFormId}?source=footer&plan=free`
    : "/signup";
}

const mainNav = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/pricing", label: "Pricing" },
  { href: "/login", label: "Log in" },
] as const;

const legalNav = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

function FooterLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium text-slate-600 transition-colors hover:text-slate-900",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function MarketingFooter({
  className,
  startFreeHref,
}: {
  className?: string;
  /** Override CTA target (e.g. pricing page uses `?source=pricing`). */
  startFreeHref?: string;
}) {
  const year = new Date().getFullYear();
  const ctaHref = startFreeHref ?? defaultStartFreeHref();

  return (
    <footer
      className={cn(
        "border-t border-slate-200/90 bg-[#F0F4F8]/80 pb-[max(2.5rem,env(safe-area-inset-bottom,0px))] pt-14 backdrop-blur-sm",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Link
              href="/"
              className="inline-flex max-w-full items-center gap-3.5 rounded-2xl outline-none ring-offset-2 ring-offset-[#F0F4F8] transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200/90 sm:size-16">
                <Image
                  src="/images/leadapp-logo.png"
                  alt="LeadAap logo"
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 text-left">
                <span className="block text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  LeadAap
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-slate-600">
                  Turn visitors into paying clients — one calm workspace.
                </span>
              </div>
            </Link>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Navigate
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                {mainNav.map((item) => (
                  <li key={item.href}>
                    <FooterLink href={item.href}>{item.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Account
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                <li>
                  <Link
                    href={ctaHref}
                    className={cn(
                      buttonVariants({ size: "sm" }),
                      "h-10 w-full justify-center rounded-xl px-4 text-sm shadow-sm shadow-indigo-500/15 sm:w-auto sm:min-w-[9rem]"
                    )}
                  >
                    Start free
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Legal
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                {legalNav.map((item) => (
                  <li key={item.href}>
                    <FooterLink href={item.href}>{item.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-8 text-center text-sm text-slate-500 sm:flex-row sm:text-left">
          <p>© {year} LeadAap. All rights reserved.</p>
          <p className="max-w-md text-slate-500 sm:text-right">
            Built for teams who sell — capture leads, follow up faster, grow revenue.
          </p>
        </div>
      </div>
    </footer>
  );
}
