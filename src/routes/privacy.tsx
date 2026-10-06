import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — FieldCO by The Command Suite" },
      { name: "description", content: "How The Command Suite collects, uses, and protects personal data in the FieldCO app." },
      { property: "og:title", content: "Privacy Policy — FieldCO by The Command Suite" },
      { property: "og:description", content: "How The Command Suite collects, uses, and protects personal data in the FieldCO app." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/privacy" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
});

function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 30, 2026">
      <section>
        <h2>1. Who we are</h2>
        <p>
          <strong>The Command Suite</strong> operates the FieldCO application ("the Service") and is the data controller
          for the personal data described in this notice. Contact: <strong>Barbie Burkett</strong>, The Command Suite.
        </p>
      </section>
      <section>
        <h2>2. Data we collect</h2>
        <ul>
          <li><strong>Account data:</strong> name, email address, login credentials.</li>
          <li><strong>Company settings:</strong> company name, logo, office project-manager email.</li>
          <li><strong>Job and change-order content:</strong> job names and addresses, photos, scope descriptions, amounts, foreman and signer names, and signatures you capture in the field.</li>
          <li><strong>Support messages</strong> you send us.</li>
          <li><strong>Usage and device data:</strong> telemetry, device identifiers, and IP address.</li>
        </ul>
      </section>
      <section>
        <h2>3. Why we use it</h2>
        <ul>
          <li>Creating and securing your account (contract performance).</li>
          <li>Providing the Service: storing change directives, generating signed packets, routing approvals (contract performance).</li>
          <li>Security and fraud prevention (legitimate interests).</li>
          <li>Product improvement and customer support (legitimate interests).</li>
          <li>Marketing, where you have consented (consent).</li>
          <li>Meeting legal obligations (legal obligation).</li>
        </ul>
      </section>
      <section>
        <h2>4. Who we share it with</h2>
        <ul>
          <li><strong>Service providers / subprocessors:</strong> hosting, database, and analytics providers that help us run the Service.</li>
          <li><strong>Merchant of Record:</strong> Paddle, for the sale of the product, subscription management, payments, tax compliance, and invoicing.</li>
          <li><strong>Professional advisers</strong> (legal, accounting) where needed.</li>
          <li><strong>Authorities</strong> where required by law.</li>
        </ul>
        <p>We do not sell your personal data.</p>
      </section>
      <section>
        <h2>5. Retention</h2>
        <p>
          We keep personal data for as long as your account is active and as needed for legal, tax, and accounting
          purposes. When data is no longer needed, it is deleted or anonymised.
        </p>
      </section>
      <section>
        <h2>6. Your rights</h2>
        <p>
          Depending on your location, you may have the right to access, correct, delete, restrict, or port your personal
          data, to object to processing, and to withdraw consent. You may also have the right to complain to your local
          supervisory authority. To exercise any right, contact Barbie Burkett at The Command Suite; we respond within
          one month.
        </p>
      </section>
      <section>
        <h2>7. International transfers</h2>
        <p>
          If your data is transferred outside the UK/EEA, we use appropriate safeguards such as standard contractual
          clauses or adequacy decisions.
        </p>
      </section>
      <section>
        <h2>8. Security</h2>
        <p>
          We apply appropriate technical and organisational measures, including encryption in transit and at rest,
          access controls, and row-level isolation of each account's data.
        </p>
      </section>
      <section>
        <h2>9. Cookies</h2>
        <p>
          The Service uses essential cookies and local storage to keep you signed in and remember your preferences.
          We do not use marketing cookies. You can clear cookies and site data in your browser settings at any time.
        </p>
      </section>
      <section>
        <h2>10. Changes</h2>
        <p>
          We may update this notice from time to time. Material changes will be flagged in the app, and the "last
          updated" date above will change.
        </p>
      </section>
    </LegalPage>
  );
}
