import type { Metadata } from "next";
import { PricingPage } from "@/components/marketing/pricing-page";

export const metadata: Metadata = {
  title: "Pricing — LeadAap",
  description:
    "Simple plans for lead capture and pipeline. Free, Starter, Growth, and Premium.",
  openGraph: {
    title: "Pricing — LeadAap",
    description:
      "Plans that scale with your funnel. Start free, upgrade anytime.",
  },
};

export default function PricingRoute() {
  return <PricingPage />;
}
