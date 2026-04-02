import type { Metadata } from "next";
import { SectionWrapper } from "@/components/marketing/site/section-wrapper";

export const metadata: Metadata = {
  title: "About — Enquireo",
  description: "Who we are, the problem we solve, and where we're headed.",
  openGraph: {
    title: "About — Enquireo",
    description: "Enquireo exists to make inbound simple, fast, and honest.",
  },
};

const blocks = [
  {
    title: "Who we are",
    body: "Enquireo is a focused product team building capture software for people who sell. We believe great tooling should feel calm — not like another enterprise dashboard you have to fight every Monday.",
  },
  {
    title: "The problem we solve",
    body: "Most teams juggle enquiry forms, spreadsheets, and inboxes that don’t talk to each other. Enquiries arrive late, context gets lost, and follow-up happens after the moment has passed. Enquireo centralizes capture so every visitor has a clear path from interest to conversation.",
  },
  {
    title: "Who can use Enquireo",
    body: "Founders validating channels, sales teams routing inbound, and agencies shipping repeatable capture for clients. If you need a fast, credible way to collect leads without standing up a custom stack, you’re in the right place.",
  },
  {
    title: "Our vision",
    body: "We’re building toward a world where the gap between attention and pipeline is measured in minutes, not days — with software that respects both your buyers and your team’s time.",
  },
];

export default function AboutPage() {
  return (
    <div className="border-b border-zinc-200/60 bg-white">
      <SectionWrapper className="py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
            About Enquireo
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-600">
            Simple software for a hard problem: turning attention into qualified pipeline.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-3xl space-y-14">
          {blocks.map((b) => (
            <section key={b.title}>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
                {b.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-zinc-600 sm:text-lg">{b.body}</p>
            </section>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
