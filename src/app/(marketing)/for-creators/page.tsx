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
  title: "For Creators",
  description:
    "Enquireo for creators: capture brand deals, collaborations, and client inquiries from one link.",
  openGraph: {
    title: "Enquireo for Creators",
    description: "Turn your audience into income - automatically.",
  },
};

export default function ForCreatorsPage() {
  return (
    <>
      <HeroSection
        headline="Turn Your Audience into Income - Automatically"
        subtext="Capture brand deals, collaborations, and client inquiries using one link."
        primaryCta="Start Free"
        primaryHref="/signup"
        secondaryCta="See How It Works"
        secondaryHref="/#how-it-works"
      />
      <PainSection
        title="Creator pipeline pain points"
        points={[
          "Messy DMs",
          "Missed opportunities",
          "No structure",
          "No monetization system",
        ]}
      />
      <SolutionGrid
        title="Your monetization funnel in one place"
        items={[
          {
            icon: "link",
            title: "Link in bio form",
            description: "One clean link for Instagram, YouTube, TikTok, and every creator channel.",
          },
          {
            icon: "messages",
            title: "Centralized inquiries",
            description: "Stop juggling DMs and email threads. Keep every opportunity organized.",
          },
          {
            icon: "handshake",
            title: "Easy collaboration tracking",
            description: "Track brand conversations from inquiry to signed deal.",
          },
          {
            icon: "bar-chart",
            title: "Monetization funnel",
            description: "Turn audience interest into booked clients and paid partnerships.",
          },
        ]}
      />
      <UseCaseCards
        title="Creator use cases"
        cases={[
          { icon: "camera", title: "Influencers", description: "Brand deals" },
          { icon: "user", title: "Coaches", description: "Book clients" },
          { icon: "wand", title: "Freelancers", description: "Service leads" },
        ]}
      />
      <ROISection message="1 brand deal can cover your yearly cost" />
      <USPBanner text="Free plan: 1 form + 10 leads credits" />
      <TestimonialsPlaceholder />
      <CTASection
        title="Start monetizing your audience today"
        description="Whether you sell services or collaborations, Enquireo helps you capture revenue-ready opportunities."
        ctaLabel="Start monetizing your audience today"
      />
    </>
  );
}
