import type { Metadata } from "next";
import { LegalDocument, LegalSection } from "@/components/marketing/site/legal-document";

export const metadata: Metadata = {
  title: "Privacy Policy — LeadApp",
  description: "How LeadApp collects, uses, and protects your data.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="border-b border-zinc-200/60 bg-white">
      <LegalDocument
        title="Privacy Policy"
        intro="This policy describes how LeadApp handles personal and usage data when you use our website and product. It is a summary for transparency — not a substitute for legal advice."
        lastUpdated="April 1, 2026"
      >
        <LegalSection id="collection" title="Data we collect">
          <p>
            We may collect identifiers you provide (such as name and email), account and billing
            information where applicable, and content you submit through forms or support channels.
            We also collect technical data typical of web apps: IP address, device and browser
            metadata, and usage events needed to operate and secure the service.
          </p>
        </LegalSection>
        <LegalSection id="usage" title="How we use data">
          <p>
            Data is used to provide and improve LeadApp, authenticate users, process transactions,
            communicate with you, detect abuse, and comply with legal obligations. We do not sell your
            personal information.
          </p>
          <p>
            Aggregated or de-identified analytics may be used to understand product performance and
            guide roadmap decisions.
          </p>
        </LegalSection>
        <LegalSection id="security" title="Security">
          <p>
            We implement administrative, technical, and organizational measures appropriate to the
            nature of the service. No method of transmission or storage is completely secure; we work
            to reduce risk and review practices as the product evolves.
          </p>
        </LegalSection>
        <LegalSection id="rights" title="Your rights">
          <p>
            Depending on where you live, you may have rights to access, correct, delete, or export
            certain personal data, or to object to or restrict certain processing. Contact us at the
            address below to make a request. We may need to verify your identity before responding.
          </p>
          <p>
            If you are in the EEA or UK, you may also have the right to lodge a complaint with a
            supervisory authority.
          </p>
        </LegalSection>
        <LegalSection id="contact" title="Contact">
          <p>
            For privacy-related questions, contact{" "}
            <a
              href="mailto:support@leadaap.com"
              className="font-medium text-indigo-600 underline-offset-4 hover:underline"
            >
              support@leadaap.com
            </a>
            .
          </p>
        </LegalSection>
      </LegalDocument>
    </div>
  );
}
