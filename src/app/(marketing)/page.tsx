import type { Metadata } from "next";
import { LeadAppHome } from "@/components/marketing/site/leadapp-home";

export const metadata: Metadata = {
  title: "LeadApp — Turn every visitor into a qualified lead",
  description:
    "Publish forms, share links, and capture leads in one calm inbox. No code, fast setup, built for startups, sales teams, and agencies.",
  openGraph: {
    title: "LeadApp — Qualified leads in seconds",
    description:
      "Modern lead capture: fast forms, shareable links, real-time tracking. Start free.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LeadApp — Qualified leads in seconds",
    description: "Modern lead capture without the bloat. Start free.",
  },
};

export default function HomePage() {
  return <LeadAppHome />;
}
