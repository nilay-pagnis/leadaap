"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  BriefcaseBusiness,
  Handshake,
  Link2,
  MessagesSquare,
  Rocket,
  Share2,
  Target,
  UserRound,
  Users,
  WandSparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";
import { AudienceToggle, type Audience } from "./audience-toggle";
import { CTABanner } from "./cta-banner";
import { FeatureCard } from "./feature-card";
import { HeroSection } from "./hero-section";
import { SectionWrapper } from "./section-wrapper";
import { USPSection } from "./usp-section";
import { UseCaseCard } from "./use-case-card";

const brands = ["Northwind", "Lumen", "Orbital", "Acme", "Studio 42", "Vertex"];

const audienceContent: Record<
  Audience,
  { headline: string; points: string[]; cta: string; icon: typeof BriefcaseBusiness }
> = {
  businesses: {
    headline: "Close more deals without losing enquiries",
    points: [
      "Capture client enquiries from website and ads",
      "Qualify prospects with smart enquiry forms",
      "Centralize enquiries in one dashboard",
      "Improve response time and conversions",
    ],
    cta: "Start capturing client enquiries",
    icon: BriefcaseBusiness,
  },
  creators: {
    headline: "Turn Followers into Paying Clients",
    points: [
      "Add your form link in bio",
      "Capture brand deals & collaborations",
      "Sell services (coaching, consulting)",
      "Replace messy DMs with structured enquiries",
    ],
    cta: "Start monetizing your audience",
    icon: UserRound,
  },
};

export function EnquireoHome() {
  const [audience, setAudience] = useState<Audience>("businesses");
  const current = audienceContent[audience];

  return (
    <>
      <HeroSection />

      <section className="border-b border-zinc-200/50 bg-white/80 py-16 sm:py-20 backdrop-blur-sm" aria-label="Social proof">
        <SectionWrapper>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Trusted by modern teams
          </p>
          <motion.ul
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
          >
            {brands.map((name) => (
              <li
                key={name}
                className="text-sm font-semibold tracking-tight text-zinc-300 transition-colors hover:text-zinc-500"
              >
                {name}
              </li>
            ))}
          </motion.ul>
        </SectionWrapper>
      </section>

      <section className="scroll-mt-24 py-20 sm:py-28" aria-labelledby="features-heading" id="features">
        <SectionWrapper>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 id="features-heading" className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              Everything you need to capture demand
            </h2>
            <p className="mt-4 text-lg text-zinc-600">
              Built for speed, clarity, and conversion - without another bloated stack.
            </p>
          </motion.div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Zap}
              title="Fast form creation"
              description="Spin up polished capture flows in minutes. Drag, label, publish - no engineers required."
            />
            <FeatureCard
              icon={Share2}
              title="Shareable links"
              description="One link for website, bio, ads, and DMs. Reach audiences wherever they discover you."
            />
            <FeatureCard
              icon={BarChart3}
              title="Real-time enquiry tracking"
              description="See who submitted, when, and from where. Keep your pipeline honest and your follow-up timely."
            />
            <FeatureCard
              icon={Link2}
              title="No-code setup"
              description="Connect your workspace, tune fields, and go live. Defaults that work out of the box."
            />
            <FeatureCard
              icon={Target}
              title="Smart qualification"
              description="Ask better questions up front so you spend time on high-intent enquiries."
            />
            <FeatureCard
              icon={Rocket}
              title="Scale your intake"
              description="From first inbound tests to large campaigns, Enquireo keeps your flow organized."
            />
          </div>
        </SectionWrapper>
      </section>

      <section className="border-y border-zinc-200/70 bg-white py-16 sm:py-20">
        <SectionWrapper>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Audience mode</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              Built for businesses and creators
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-600 sm:text-lg">
              Choose your mode to see how Enquireo helps your exact workflow.
            </p>
            <div className="mt-8 flex justify-center">
              <AudienceToggle value={audience} onChange={setAudience} />
            </div>
          </div>

          <motion.div
            key={audience}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-12 rounded-2xl border border-white/80 bg-white/85 p-6 shadow-[0_16px_48px_-20px_rgba(79,70,229,0.15)] backdrop-blur-md sm:p-10"
          >
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                <current.icon className="size-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-balance text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                  {current.headline}
                </h3>
                <ul className="mt-5 space-y-2.5 text-sm text-zinc-700 sm:text-base">
                  {current.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="mt-1 size-2 shrink-0 rounded-full bg-indigo-500" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "mt-7 inline-flex h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-blue-500"
                  )}
                >
                  {current.cta}
                </Link>
                <p className="mt-3 text-xs font-medium text-zinc-500">No credit card required</p>
              </div>
            </div>
          </motion.div>
        </SectionWrapper>
      </section>

      <section id="use-cases" className="scroll-mt-24 py-20 sm:py-28" aria-labelledby="use-cases-heading">
        <SectionWrapper>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 id="use-cases-heading" className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              Use cases
            </h2>
            <p className="mt-4 text-lg text-zinc-600">Pick a workflow and launch today.</p>
          </motion.div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <UseCaseCard
              icon={BriefcaseBusiness}
              title="IT Services"
              description="Get project inquiries."
              href="/use-cases/it-services"
            />
            <UseCaseCard
              icon={WandSparkles}
              title="Agencies"
              description="Capture client briefs."
              href="/use-cases/agencies"
            />
            <UseCaseCard
              icon={Users}
              title="Creators"
              description="Get brand deals."
              href="/use-cases/creators"
            />
            <UseCaseCard
              icon={Handshake}
              title="Coaches"
              description="Book discovery calls."
              href="/use-cases/coaches"
            />
            <UseCaseCard
              icon={MessagesSquare}
              title="Freelancers"
              description="Collect client requirements."
              href="/use-cases/freelancers"
            />
          </div>
        </SectionWrapper>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-24 border-y border-zinc-200/50 bg-white/90 py-20 sm:py-28 backdrop-blur-sm"
        aria-labelledby="how-heading"
      >
        <SectionWrapper>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 id="how-heading" className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-zinc-600">Three steps from interest to pipeline.</p>
          </motion.div>
          <ol className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { icon: WandSparkles, title: "Create your enquiry form", body: "Build in minutes with smart defaults." },
              { icon: Share2, title: "Share link anywhere", body: "Website, bio, ads, WhatsApp, and more." },
              { icon: BarChart3, title: "Capture and manage enquiries", body: "Track responses and follow up faster." },
            ].map((item, i) => (
              <motion.li
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className="group rounded-2xl border border-white/60 bg-gradient-to-b from-white/95 to-zinc-50/80 p-6 shadow-[0_12px_40px_-18px_rgba(79,70,229,0.12)] backdrop-blur-md transition-shadow duration-300 hover:shadow-[0_20px_48px_-18px_rgba(79,70,229,0.2)]"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/12 to-violet-500/10 text-indigo-600 ring-1 ring-indigo-500/15">
                  <item.icon className="size-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-zinc-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.body}</p>
              </motion.li>
            ))}
          </ol>
        </SectionWrapper>
      </section>

      <USPSection />

      <section className="bg-zinc-50/80 py-20 sm:py-28" aria-label="Testimonials">
        <SectionWrapper>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              Teams shipping faster with Enquireo
            </h2>
            <p className="mt-4 text-lg text-zinc-600">Placeholder testimonials — swap with customer quotes.</p>
          </motion.div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              "“We replaced our contact stack in a day and improved enquiry response speed by 2x.”",
              "“Perfect for bio links. We finally stopped losing brand opportunities in DMs.”",
              "“Our agency now captures cleaner briefs and qualifies enquiries before calls.”",
            ].map((quote) => (
              <motion.div
                key={quote}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.35 }}
                className="rounded-2xl border border-white/70 bg-white/85 p-6 text-sm leading-relaxed text-zinc-700 shadow-[0_12px_40px_-16px_rgba(15,23,42,0.1)] backdrop-blur-md"
              >
                {quote}
              </motion.div>
            ))}
          </div>
        </SectionWrapper>
      </section>

      <SectionWrapper className="py-20 sm:py-28">
        <CTABanner
          title="Stop losing enquiries. Start converting today."
          description="Whether you are a business or creator, Enquireo helps you turn interest into revenue."
          primaryHref="/signup"
          primaryLabel="Get your first enquiry in minutes"
          secondaryHref="/pricing"
          secondaryLabel="See plans"
          microcopy="No credit card required"
        />
      </SectionWrapper>
    </>
  );
}
