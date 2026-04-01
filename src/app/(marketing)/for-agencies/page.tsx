import type { Metadata } from "next";
import {
  CTASection,
  HeroSection,
  PainSection,
  ROISection,
  SolutionGrid,
  TestimonialsPlaceholder,
  UseCaseCards,
  USPBanner,
} from "@/components/marketing/site/niche-landing";

export const metadata: Metadata = {
  title: "For Agencies",
  description:
    "LeadApp for agencies: capture, qualify, and close better clients with structured lead systems.",
  openGraph: {
    title: "LeadApp for Agencies",
    description: "Stop losing high-value clients to poor lead systems.",
  },
};

export default function ForAgenciesPage() {
  return (
    <>
      <HeroSection
        headline="Stop Losing High-Value Clients to Poor Lead Systems"
        subtext="Capture, qualify, and close better clients using structured lead forms."
        primaryCta="Start Free"
        primaryHref="/signup"
        secondaryCta="Book Demo"
        secondaryHref="mailto:hello@leadaap.com?subject=Book%20Demo%20-%20LeadApp%20for%20Agencies"
      />
      <PainSection
        title="What is costing agencies revenue today?"
        points={[
          "Leads scattered across channels",
          "No qualification system",
          "Slow response time",
          "Lost deals",
        ]}
      />
      <SolutionGrid
        title="A lead system designed to win better clients"
        items={[
          {
            icon: "folder-kanban",
            title: "Centralized lead capture",
            description: "Collect inquiries from ads, website, and social in one pipeline.",
          },
          {
            icon: "clipboard-list",
            title: "Smart qualification forms",
            description: "Ask the right questions so your team prioritizes high-intent opportunities.",
          },
          {
            icon: "briefcase",
            title: "CRM-like dashboard",
            description: "Track statuses, manage context, and keep every prospect moving forward.",
          },
          {
            icon: "bar-chart",
            title: "Faster response = higher conversion",
            description: "Respond quickly with cleaner data and increase win rates over time.",
          },
        ]}
      />
      <UseCaseCards
        title="Agency use cases"
        cases={[
          { icon: "target", title: "IT Services", description: "Project inquiries" },
          { icon: "building", title: "Marketing Agencies", description: "Client briefs" },
          { icon: "briefcase", title: "SaaS Agencies", description: "Onboarding" },
        ]}
      />
      <ROISection message="1 extra client/month can generate 10x ROI" />
      <USPBanner text="Free plan includes 1 form + 10 lead credits" />
      <TestimonialsPlaceholder />
      <CTASection
        title="Start capturing better clients today"
        description="Build a repeatable client intake system that helps your team close more deals."
        ctaLabel="Start capturing better clients today"
      />
    </>
  );
}
