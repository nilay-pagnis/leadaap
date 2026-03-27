import type { Metadata } from "next";
import { PricingPage } from "@/components/marketing/pricing-page";

export const metadata: Metadata = {
  title: "Pricing — LeadAap",
  description:
    "Simple plans for lead capture and pipeline. Start a free pilot or book a demo for Enterprise.",
  openGraph: {
    title: "Pricing — LeadAap",
    description:
      "Plans that scale with your funnel. 5-day free trial, no credit card.",
  },
};

export default function PricingRoute() {
  return <PricingPage />;
}
