import type { Metadata } from "next";
import { EnquireoHome } from "@/components/marketing/site/enquireo-home";

export const metadata: Metadata = {
  title: "Enquireo — Capture. Qualify. Convert.",
  description:
    "Turn every enquiry into a qualified opportunity with Enquireo.",
  openGraph: {
    title: "Enquireo — Capture. Qualify. Convert.",
    description:
      "Enquiry capture and qualification: fast forms, shareable links, real-time tracking. Start free.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Enquireo — Capture. Qualify. Convert.",
    description:
      "Turn every enquiry into a qualified opportunity. Start free.",
  },
};

export default function HomePage() {
  return <EnquireoHome />;
}
