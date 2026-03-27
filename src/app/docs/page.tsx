import type { Metadata } from "next";
import { headers } from "next/headers";
import { DocsPageClient } from "@/components/docs/docs-page-client";

export const metadata: Metadata = {
  title: "Embed & developer docs — LeadAap",
  description:
    "Embed LeadAap forms on any website with a small script and responsive iframe.",
};

function fallbackOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://your-domain.com"
  );
}

export default async function DocsPage() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const protoHeader = h.get("x-forwarded-proto");
  const isLocal =
    host?.includes("localhost") === true || host?.startsWith("127.") === true;
  const proto = protoHeader ?? (isLocal ? "http" : "https");
  const origin =
    host && host.length > 0
      ? `${proto}://${host}`.replace(/\/$/, "")
      : fallbackOrigin();

  return <DocsPageClient siteOrigin={origin} />;
}
