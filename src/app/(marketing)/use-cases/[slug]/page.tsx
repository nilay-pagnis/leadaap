import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { UseCasePageContent } from "@/components/marketing/site/niche-landing";
import { UseCaseLandingPage } from "@/components/marketing/site/niche-landing";

type Slug = "it-services" | "agencies" | "creators" | "coaches" | "freelancers";

const contentBySlug: Record<Slug, UseCasePageContent> = {
  "it-services": {
    hero: {
      headline: "Win Better Project Inquiries Without Extra Admin",
      subtext: "Capture technical requirements early and qualify leads before your first call.",
      primaryCta: "Start Free",
      secondaryCta: "See Demo",
      secondaryHref: "/#product",
    },
    painTitle: "Why IT service teams lose good deals",
    painPoints: [
      "Project requests arrive from multiple channels with missing details",
      "Discovery calls start without clear budgets or timelines",
      "Slow triage delays first response to high-intent prospects",
      "Unqualified inquiries consume engineering and sales time",
    ],
    solutionTitle: "Enquireo helps IT teams qualify faster",
    solutions: [
      { icon: "folder-kanban", title: "Centralized project intake", description: "Website, ads, and referrals in one queue." },
      { icon: "clipboard-list", title: "Technical qualification forms", description: "Collect scope, stack, timeline, and budget up front." },
      { icon: "bar-chart", title: "Priority lead view", description: "Rank opportunities by fit and urgency." },
      { icon: "briefcase", title: "Client-ready pipeline", description: "Move inquiries from contact to proposal cleanly." },
    ],
    howItWorksTitle: "How IT services teams use Enquireo",
    howItWorksSteps: [
      { icon: "wand", title: "Create your intake form", body: "Add project scope and qualification questions." },
      { icon: "link", title: "Share across channels", body: "Publish on site, ads, and outbound campaigns." },
      { icon: "bar-chart", title: "Capture and prioritize", body: "Focus first on high-value project inquiries." },
    ],
    roiMessage: "One additional qualified project can cover annual software costs",
    useCasesTitle: "IT services use case examples",
    useCases: [
      { icon: "target", title: "Custom software teams", description: "Capture detailed project inquiries" },
      { icon: "building", title: "Managed services", description: "Collect recurring support requirements" },
      { icon: "briefcase", title: "DevOps consultancies", description: "Pre-qualify infrastructure engagements" },
    ],
    uspText: "Free plan includes 1 form + 10 leads credits",
    finalCta: {
      title: "Start capturing better IT leads today",
      description: "Qualify faster, respond sooner, and close stronger-fit projects.",
      label: "Start capturing IT leads",
    },
  },
  agencies: {
    hero: {
      headline: "Close Better Clients With Smarter Lead Filtering",
      subtext: "Capture, qualify, and close better clients using structured lead forms.",
      primaryCta: "Start Free",
      secondaryCta: "Book Demo",
      secondaryHref: "mailto:hello@enquireo.com?subject=Book%20Demo%20-%20Enquireo%20for%20Agencies",
    },
    painTitle: "What slows agency growth",
    painPoints: [
      "Leads scattered across channels",
      "No qualification system",
      "Slow response time",
      "Lost deals",
    ],
    solutionTitle: "A lead system designed for agency teams",
    solutions: [
      { icon: "folder-kanban", title: "Centralized lead capture", description: "Collect inquiries from ads, website, and social." },
      { icon: "clipboard-list", title: "Smart qualification forms", description: "Prioritize high-intent clients before calls." },
      { icon: "briefcase", title: "CRM-like dashboard", description: "Track status and context for every prospect." },
      { icon: "bar-chart", title: "Faster response, higher conversion", description: "Win more by replying with context instantly." },
    ],
    howItWorksTitle: "How agencies run intake with Enquireo",
    howItWorksSteps: [
      { icon: "wand", title: "Build your client brief form", body: "Ask budget, goals, timeline, and scope." },
      { icon: "link", title: "Share across channels", body: "Drop your link in ads, DMs, and website CTAs." },
      { icon: "bar-chart", title: "Close better-fit deals", body: "Work only leads that match your ICP." },
    ],
    roiMessage: "1 extra client/month can generate 10x ROI",
    useCasesTitle: "Agency use case examples",
    useCases: [
      { icon: "target", title: "IT Services", description: "Project inquiries" },
      { icon: "building", title: "Marketing Agencies", description: "Client briefs" },
      { icon: "briefcase", title: "SaaS Agencies", description: "Onboarding" },
    ],
    uspText: "Free plan includes 1 form + 10 leads credits",
    finalCta: {
      title: "Start capturing better clients today",
      description: "Create a repeatable client intake flow your team can scale.",
      label: "Start capturing better clients today",
    },
  },
  creators: {
    hero: {
      headline: "Turn Your Audience into Income - Automatically",
      subtext: "Capture brand deals, collaborations, and client inquiries using one link.",
      primaryCta: "Start Free",
      secondaryCta: "See How It Works",
      secondaryHref: "/#how-it-works",
    },
    painTitle: "Why creators miss monetization opportunities",
    painPoints: [
      "Messy DMs hide important opportunities",
      "No structured way to qualify collaborations",
      "Audience intent is lost between platforms",
      "Manual follow-up slows deal flow",
    ],
    solutionTitle: "A monetization-ready inbound system",
    solutions: [
      { icon: "link", title: "Link in bio form", description: "One destination for every partnership inquiry." },
      { icon: "messages", title: "Centralized inquiries", description: "Stop juggling DMs and email threads." },
      { icon: "handshake", title: "Collaboration tracking", description: "Track each brand conversation end-to-end." },
      { icon: "bar-chart", title: "Monetization funnel", description: "Convert audience attention into revenue." },
    ],
    howItWorksTitle: "How creators monetize with Enquireo",
    howItWorksSteps: [
      { icon: "wand", title: "Create your creator form", body: "Ask campaign details and budget fit." },
      { icon: "link", title: "Add to bio and content", body: "Share one link everywhere your audience clicks." },
      { icon: "bar-chart", title: "Capture and close", body: "Turn inbound opportunities into paid collaborations." },
    ],
    roiMessage: "1 brand deal can cover your yearly cost",
    useCasesTitle: "Creator use case examples",
    useCases: [
      { icon: "camera", title: "Influencers", description: "Brand deals" },
      { icon: "user", title: "Coaches", description: "Book clients" },
      { icon: "wand", title: "Freelancers", description: "Service leads" },
    ],
    uspText: "Free plan: 1 form + 10 leads credits",
    finalCta: {
      title: "Start monetizing your audience today",
      description: "Build a reliable pipeline for brand partnerships and paid offers.",
      label: "Start monetizing your audience today",
    },
  },
  coaches: {
    hero: {
      headline: "Fill Your Discovery Calls With Better-Fit Clients",
      subtext: "Qualify inquiries before the call and onboard ideal clients with less back-and-forth.",
      primaryCta: "Start Free",
      secondaryCta: "See Demo",
      secondaryHref: "/#product",
    },
    painTitle: "Common coaching lead bottlenecks",
    painPoints: [
      "Discovery calls booked without context",
      "Poor-fit prospects consume calendar space",
      "Onboarding details collected too late",
      "Follow-up workflows are manual and inconsistent",
    ],
    solutionTitle: "A coaching pipeline that starts qualified",
    solutions: [
      { icon: "clipboard-list", title: "Pre-call qualification", description: "Collect goals, readiness, and budget before scheduling." },
      { icon: "messages", title: "Centralized inquiries", description: "Track all prospects from one dashboard." },
      { icon: "bar-chart", title: "Faster follow-up", description: "Prioritize the right prospects immediately." },
      { icon: "briefcase", title: "Smooth onboarding", description: "Capture key onboarding details in your first touchpoint." },
    ],
    howItWorksTitle: "How coaches use Enquireo",
    howItWorksSteps: [
      { icon: "wand", title: "Create your application form", body: "Capture fit, goals, and preferred coaching outcomes." },
      { icon: "link", title: "Share where prospects engage", body: "Website, social bio, newsletter, and community." },
      { icon: "bar-chart", title: "Review and onboard", body: "Select high-fit clients and move to discovery quickly." },
    ],
    roiMessage: "One additional high-ticket client can return many times your annual plan",
    useCasesTitle: "Coaching use case examples",
    useCases: [
      { icon: "user", title: "Business coaches", description: "Pre-qualify strategy calls" },
      { icon: "target", title: "Career coaches", description: "Capture goals and readiness" },
      { icon: "wand", title: "Health coaches", description: "Structure intake and onboarding" },
    ],
    uspText: "Free plan includes 1 form + 10 leads credits",
    finalCta: {
      title: "Start booking better discovery calls today",
      description: "Qualify first, coach better, and convert more of the right clients.",
      label: "Start booking discovery calls",
    },
  },
  freelancers: {
    hero: {
      headline: "Collect Better Client Requirements Before Work Starts",
      subtext: "Replace vague DMs with structured intake so every project begins with clarity.",
      primaryCta: "Start Free",
      secondaryCta: "See Demo",
      secondaryHref: "/#product",
    },
    painTitle: "Why freelance projects go sideways",
    painPoints: [
      "Requirements arrive incomplete or unclear",
      "Scope confusion causes rework and delays",
      "Important details get lost across chats and emails",
      "Qualification happens too late in the process",
    ],
    solutionTitle: "Enquireo gives freelancers intake clarity",
    solutions: [
      { icon: "clipboard-list", title: "Structured requirement forms", description: "Collect scope, deliverables, timeline, and budget." },
      { icon: "messages", title: "One source of truth", description: "Keep all inquiries in one organized dashboard." },
      { icon: "target", title: "Fit filtering", description: "Focus only on projects that match your services." },
      { icon: "bar-chart", title: "Faster proposal cycles", description: "Respond with complete context and fewer revisions." },
    ],
    howItWorksTitle: "How freelancers use Enquireo",
    howItWorksSteps: [
      { icon: "wand", title: "Create your project brief form", body: "Ask exactly what you need to estimate accurately." },
      { icon: "link", title: "Share your intake link", body: "Portfolio, social profiles, and job platform messages." },
      { icon: "bar-chart", title: "Qualify and propose", body: "Send better proposals with less scope ambiguity." },
    ],
    roiMessage: "Avoiding one scope-mismatch project can pay for your plan many times over",
    useCasesTitle: "Freelancer use case examples",
    useCases: [
      { icon: "wand", title: "Design freelancers", description: "Capture branding and asset requirements" },
      { icon: "briefcase", title: "Developers", description: "Pre-qualify technical project fit" },
      { icon: "messages", title: "Copywriters", description: "Gather content goals before kickoff" },
    ],
    uspText: "Free plan includes 1 form + 10 leads credits",
    finalCta: {
      title: "Start qualifying freelance leads today",
      description: "Reduce scope confusion and convert better-fit clients faster.",
      label: "Start qualifying freelance leads",
    },
  },
};

export function generateStaticParams() {
  return Object.keys(contentBySlug).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const slug = params.slug as Slug;
  const content = contentBySlug[slug];
  if (!content) {
    return {
      title: "Use Cases",
      description: "Enquireo use case pages.",
    };
  }
  return {
    title: `Use case: ${content.hero.headline}`,
    description: content.hero.subtext,
  };
}

export default function UseCasePage({ params }: { params: { slug: string } }) {
  const slug = params.slug as Slug;
  const content = contentBySlug[slug];
  if (!content) notFound();
  return <UseCaseLandingPage content={content} />;
}
