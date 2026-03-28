import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — LeadAap",
  description: "Contact LeadAap for product questions and support.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Contact</h1>
      <p className="mt-4 text-slate-600">
        Reach us at <a className="text-primary underline" href="mailto:support@leadaap.com">support@leadaap.com</a>.
      </p>
    </main>
  );
}
