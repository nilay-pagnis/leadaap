import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — LeadAap",
  description: "Learn more about LeadAap and our mission.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">About LeadAap</h1>
      <p className="mt-4 text-slate-600">
        LeadAap helps teams capture, organize, and convert high-quality leads with less manual work.
      </p>
    </main>
  );
}
