import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy — LeadAap",
  description: "LeadAap privacy policy.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Privacy Policy</h1>
      <p className="mt-4 text-slate-600">
        We respect your privacy and handle data responsibly. This page outlines how LeadAap collects and uses information.
      </p>
    </main>
  );
}
