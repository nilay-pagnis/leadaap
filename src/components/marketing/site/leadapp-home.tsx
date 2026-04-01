"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Building2,
  Link2,
  Rocket,
  Share2,
  Target,
  Zap,
} from "lucide-react";
import { CTABanner } from "./cta-banner";
import { FeatureCard } from "./feature-card";
import { HeroSection } from "./hero-section";
import { SectionWrapper } from "./section-wrapper";

const brands = ["Northwind", "Lumen", "Orbital", "Acme", "Studio 42", "Vertex"];

export function LeadAppHome() {
  return (
    <>
      <HeroSection />

      <section className="border-b border-zinc-200/60 bg-white py-12 sm:py-14" aria-label="Social proof">
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

      <section id="features" className="scroll-mt-24 py-16 sm:py-24" aria-labelledby="features-heading">
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
              Built for speed, clarity, and conversion — without another bloated stack.
            </p>
          </motion.div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Zap}
              title="Fast form creation"
              description="Spin up polished capture flows in minutes. Drag, label, publish — no engineers required."
            />
            <FeatureCard
              icon={Share2}
              title="Shareable links"
              description="One link for campaigns, landing pages, and DMs. Embed or share anywhere your audience already is."
            />
            <FeatureCard
              icon={BarChart3}
              title="Real-time lead tracking"
              description="See who submitted, when, and from where. Keep your pipeline honest and your follow-up timely."
            />
            <FeatureCard
              icon={Link2}
              title="No-code setup"
              description="Connect your workspace, tune fields, and go live. Defaults that work — customization when you need it."
            />
            <FeatureCard
              icon={Target}
              title="Conversion-focused UX"
              description="Calm layouts, clear progress, and mobile-ready experiences that respect your brand."
            />
            <FeatureCard
              icon={Rocket}
              title="Scale with your volume"
              description="From first experiments to serious inbound — LeadApp grows without turning your stack into a science project."
            />
          </div>
        </SectionWrapper>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-24 border-y border-zinc-200/60 bg-white py-16 sm:py-24"
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
            <p className="mt-4 text-lg text-zinc-600">Three steps from idea to inbox.</p>
          </motion.div>
          <ol className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create your form",
                body: "Pick fields that match your funnel. Start from best-practice templates or build your own.",
              },
              {
                step: "02",
                title: "Share your link",
                body: "Drop the link into ads, email, or your site. Embeds available when you want a native feel.",
              },
              {
                step: "03",
                title: "Capture leads",
                body: "Responses land in one place. Route, tag, and follow up without digging through spreadsheets.",
              },
            ].map((item, i) => (
              <motion.li
                key={item.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-6 shadow-sm"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                  {item.step}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-zinc-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.body}</p>
              </motion.li>
            ))}
          </ol>
        </SectionWrapper>
      </section>

      <section id="use-cases" className="scroll-mt-24 py-16 sm:py-24" aria-labelledby="use-cases-heading">
        <SectionWrapper>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 id="use-cases-heading" className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              Built for how you actually sell
            </h2>
            <p className="mt-4 text-lg text-zinc-600">
              Whether you&apos;re solo or scaling a team, the workflow stays simple.
            </p>
          </motion.div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Rocket,
                title: "Startups",
                text: "Validate channels fast. Ship forms tonight, learn what converts tomorrow.",
              },
              {
                icon: Building2,
                title: "Sales teams",
                text: "Give reps a single inbox for inbound. Less admin, more conversations that close.",
              },
              {
                icon: Target,
                title: "Agencies",
                text: "Repeatable capture for every client. White-label friendly structure, consistent delivery.",
              },
            ].map((u, i) => (
              <motion.div
                key={u.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -3 }}
                className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_16px_40px_-16px_rgba(79,70,229,0.12)] sm:p-8"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <u.icon className="size-5" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-zinc-900">{u.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{u.text}</p>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>
      </section>

      <SectionWrapper className="py-16 sm:py-24">
        <CTABanner
          title="Ready to turn traffic into pipeline?"
          description="Start free, invite your team, and publish your first form in minutes. No credit card required to begin."
          primaryHref="/signup"
          primaryLabel="Get started"
          secondaryHref="/pricing"
          secondaryLabel="View pricing"
        />
      </SectionWrapper>
    </>
  );
}
