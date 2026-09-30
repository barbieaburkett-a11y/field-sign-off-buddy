import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Service — FieldCO by The Command Suite" },
      { name: "description", content: "Terms of Service for FieldCO, the field change-order protection app for construction subcontractors, operated by The Command Suite." },
      { property: "og:title", content: "Terms of Service — FieldCO by The Command Suite" },
      { property: "og:description", content: "Terms of Service for FieldCO, the field change-order protection app for construction subcontractors, operated by The Command Suite." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/terms" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
});

function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="September 30, 2026">
      <section>
        <h2>1. Agreement</h2>
        <p>
          These Terms of Service ("Terms") are between you and <strong>The Command Suite</strong> ("we", "us", "the Seller"),
          the operator of the FieldCO application ("the Service"). By creating an account or continuing to use the Service,
          you agree to these Terms. If you use the Service on behalf of a company, you confirm you have authority to bind
          that company, and that you are of legal age to enter this agreement.
        </p>
      </section>
      <section>
        <h2>2. The Service</h2>
        <p>
          FieldCO helps construction subcontractors capture field change directives: photos, scope descriptions, lump-sum
          amounts, on-screen or remote signatures, status tracking, and signed change directive packets for pay applications.
          We grant you a limited, non-exclusive, non-transferable right to use the Service within your selected plan.
        </p>
      </section>
      <section>
        <h2>3. Acceptable use</h2>
        <p>You must not misuse the Service, including:</p>
        <ul>
          <li>Using it for any unlawful purpose, fraud, or spam.</li>
          <li>Uploading content that infringes others' intellectual property rights.</li>
          <li>Interfering with the Service's security, including introducing malware, probing, or scraping.</li>
          <li>Reverse engineering, reselling, redistributing, or circumventing technical limits of the Service.</li>
        </ul>
      </section>
      <section>
        <h2>4. Accounts and credentials</h2>
        <p>
          You must provide accurate information and keep it updated. You are responsible for maintaining the
          confidentiality of your account credentials and for all activity under your account.
        </p>
      </section>
      <section>
        <h2>5. Intellectual property</h2>
        <p>
          The Command Suite retains all ownership of the Service and its intellectual property, including software,
          documentation, and branding. You retain ownership of the content you upload (photos, descriptions, signatures);
          you grant us a limited license to host and process that content solely to provide the Service.
        </p>
      </section>
      <section>
        <h2>6. Payments and subscriptions</h2>
        <p>
          The Service is offered as a paid subscription (Starter, Pro, or Unlimited), billed monthly, with a 14-day free
          trial for new accounts. Our order process is conducted by our online reseller Paddle.com. Paddle.com is the
          Merchant of Record for all our orders. Paddle provides all customer service inquiries and handles returns.
          Payment, billing, tax, cancellation, and refund mechanics are governed by{" "}
          <a href="https://www.paddle.com/legal/checkout-buyer-terms" target="_blank" rel="noreferrer">Paddle's Buyer Terms</a>.
          You may cancel your subscription at any time; access continues until the end of the current billing period.
        </p>
      </section>
      <section>
        <h2>7. Service level</h2>
        <p>
          We work hard to keep the Service reliable but do not guarantee uninterrupted or error-free performance.
          The Service is provided "as is" and we disclaim all implied warranties, including merchantability and fitness
          for a particular purpose, to the fullest extent permitted by law.
        </p>
      </section>
      <section>
        <h2>8. Liability</h2>
        <p>
          To the fullest extent permitted by law, we are not liable for indirect, consequential, or special damages
          (including loss of profits, data, or goodwill), and our aggregate liability is capped at the fees you paid in
          the 12 months before the claim. Nothing in these Terms excludes liability for fraud, death, or personal injury
          where required by law.
        </p>
      </section>
      <section>
        <h2>9. Suspension and termination</h2>
        <p>
          We may suspend or terminate your access for material breach of these Terms, non-payment, security or fraud risk,
          or repeated or serious policy violations. When access ends, you may request an export of your data for 30 days,
          after which it may be deleted.
        </p>
      </section>
      <section>
        <h2>10. General</h2>
        <p>
          You may not assign these Terms without our consent; we may assign them in connection with a merger or
          acquisition. We are excused from performance during events beyond our reasonable control. These Terms are
          governed by the laws of the Seller's jurisdiction, and disputes will be resolved in the courts of that
          jurisdiction.
        </p>
      </section>
      <section>
        <h2>11. Contact</h2>
        <p>
          Questions about these Terms: <strong>Barbie Burkett</strong>, The Command Suite — via the contact options in the app.
        </p>
      </section>
    </LegalPage>
  );
}
