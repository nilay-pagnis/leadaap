import type { Metadata } from "next";
import { PricingPage } from "@/components/marketing/pricing-page";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple plans for lead capture and pipeline. Start free, upgrade anytime.",
  openGraph: {
    title: "Pricing — LeadApp",
    description: "Plans that scale with your funnel. Start free, upgrade anytime.",
  },
};

export default function PricingRoute() {
  return <PricingPage />;
}
