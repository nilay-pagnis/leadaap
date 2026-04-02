import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/marketing/site/contact-form";
import { SectionWrapper } from "@/components/marketing/site/section-wrapper";

export const metadata: Metadata = {
  title: "Contact — Enquireo",
  description: "Reach the Enquireo team for product questions and support.",
  openGraph: {
    title: "Contact — Enquireo",
    description: "We’d love to hear from you.",
  },
};

const supportEmail = "support@enquireo.com";

export default function ContactPage() {
  return (
    <div className="border-b border-zinc-200/60 bg-zinc-50/50">
      <SectionWrapper className="py-16 sm:py-24">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
            Contact us
          </h1>
          <p className="mt-4 text-lg text-zinc-600">
            Questions about Enquireo, partnerships, or support — send a note and we’ll respond as soon
            as we can.
          </p>
          <p className="mt-4 text-sm text-zinc-500">
            Prefer email?{" "}
            <Link
              href={`mailto:${supportEmail}`}
              className="font-medium text-indigo-600 underline-offset-4 hover:underline"
            >
              {supportEmail}
            </Link>
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-lg rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] sm:p-8">
          <ContactForm />
        </div>
      </SectionWrapper>
    </div>
  );
}
