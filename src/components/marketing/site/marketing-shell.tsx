import type { ReactNode } from "react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-zinc-50 text-zinc-950 antialiased">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="marketing-gradient-mesh absolute inset-0" aria-hidden />
        <div
          className="bg-noise absolute inset-0 opacity-[0.22] mix-blend-overlay"
          aria-hidden
        />
      </div>
      <SiteHeader />
      <div className="relative flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
