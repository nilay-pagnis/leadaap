import type { Metadata } from "next";
import { LegalDocument, LegalSection } from "@/components/marketing/site/legal-document";

export const metadata: Metadata = {
  title: "Terms of Service — Enquireo",
  description: "Terms governing use of Enquireo.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <div className="border-b border-zinc-200/60 bg-white">
      <LegalDocument
        title="Terms of Service"
        intro="By accessing or using Enquireo, you agree to these terms. If you disagree, do not use the service."
        lastUpdated="April 1, 2026"
      >
        <LegalSection id="usage" title="Acceptable use">
          <p>
            You agree to use Enquireo only for lawful purposes and in line with applicable regulations.
            You will not attempt to disrupt the service, access data you are not authorized to view,
            or use the product to distribute malware, spam, or misleading content.
          </p>
        </LegalSection>
        <LegalSection id="account" title="Accounts and responsibility">
          <p>
            You are responsible for safeguarding credentials and for activity under your account. You
            must provide accurate registration information and keep it up to date. Notify us promptly
            if you suspect unauthorized access.
          </p>
        </LegalSection>
        <LegalSection id="restrictions" title="Restrictions">
          <p>
            You may not reverse engineer, scrape, or resell access to Enquireo except as expressly
            permitted. You may not use the service to violate privacy rights, send unsolicited bulk
            communications without consent, or process illegal content.
          </p>
        </LegalSection>
        <LegalSection id="liability" title="Disclaimer and limitation of liability">
          <p>
            Enquireo is provided “as is” to the fullest extent permitted by law. We disclaim implied
            warranties where allowed. To the maximum extent permitted, our aggregate liability arising
            out of these terms or the service will not exceed the amounts you paid us in the twelve
            months before the claim (or, if none, fifty dollars).
          </p>
          <p>
            Some jurisdictions do not allow certain limitations; in those cases, our liability is
            limited to the minimum permitted by law.
          </p>
        </LegalSection>
        <LegalSection id="changes" title="Changes">
          <p>
            We may update these terms from time to time. Continued use after changes become effective
            constitutes acceptance. Material changes will be communicated in a reasonable manner, such
            as in-product notice or email where appropriate.
          </p>
        </LegalSection>
        <LegalSection id="contact" title="Contact">
          <p>
            Questions about these terms:{" "}
            <a
              href="mailto:support@enquireo.com"
              className="font-medium text-indigo-600 underline-offset-4 hover:underline"
            >
              support@enquireo.com
            </a>
            .
          </p>
        </LegalSection>
      </LegalDocument>
    </div>
  );
}
