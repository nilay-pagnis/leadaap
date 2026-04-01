import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";
import { SectionWrapper } from "./section-wrapper";

export function USPSection() {
  return (
    <section className="border-y border-zinc-200/70 bg-white py-16 sm:py-24">
      <SectionWrapper>
        <div className="mx-auto max-w-4xl rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/80 via-white to-blue-50/70 p-6 shadow-[0_16px_40px_-20px_rgba(16,185,129,0.25)] sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            <BadgeCheck className="size-3.5" />
            Free Offer
          </div>
          <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Start Free — No Risk
          </h2>
          <ul className="mt-6 space-y-2 text-base text-zinc-700 sm:text-lg">
            <li>- Get 1 free form</li>
            <li>- 10 lead credits included</li>
            <li>- No credit card required</li>
          </ul>
          <div className="mt-8">
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 min-w-[180px] rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:from-indigo-500 hover:to-blue-500"
              )}
            >
              Start for Free
            </Link>
            <p className="mt-3 text-xs font-medium text-zinc-500">No credit card required</p>
          </div>
        </div>
      </SectionWrapper>
    </section>
  );
}
