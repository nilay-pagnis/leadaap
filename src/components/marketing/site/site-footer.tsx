import Link from "next/link";
import { SiteLogo } from "@/components/brand/site-logo";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-zinc-200/80 bg-white pb-[max(2rem,env(safe-area-inset-bottom,0px))] pt-12 sm:pt-16"
      role="contentinfo"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="LeadApp home">
              <SiteLogo size="sm" />
              <span className="text-lg font-semibold tracking-tight text-zinc-900">LeadApp</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600">
              Turn visitors into qualified leads — fast forms, shareable links, and a calm inbox.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-3" aria-label="Footer">
            {footerLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-12 border-t border-zinc-100 pt-8 text-center text-sm text-zinc-500 sm:text-left">
          © {year} LeadApp. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
