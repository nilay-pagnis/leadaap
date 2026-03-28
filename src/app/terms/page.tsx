import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms — LeadAap",
  description: "LeadAap terms and conditions.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Terms and Conditions</h1>
      <p className="mt-4 text-slate-600">
        By using LeadAap, you agree to the terms governing access, usage, and acceptable conduct on the platform.
      </p>
    </main>
  );
}
