import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/refunds")({
  component: RefundsPage,
  head: () => ({
    meta: [
      { title: "Refund Policy — FieldCO by The Command Suite" },
      { name: "description", content: "Refund Policy for FieldCO subscriptions: 30-day money-back guarantee, processed by Paddle." },
      { property: "og:title", content: "Refund Policy — FieldCO by The Command Suite" },
      { property: "og:description", content: "Refund Policy for FieldCO subscriptions: 30-day money-back guarantee, processed by Paddle." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/refunds" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/refunds" }],
  }),
});

function RefundsPage() {
  return (
    <LegalPage title="Refund Policy" updated="September 30, 2026">
      <section>
        <h2>30-day money-back guarantee</h2>
        <p>
          We offer a 30-day money-back guarantee on FieldCO subscriptions (Starter, Pro, and Unlimited), sold by
          The Command Suite. If you're not satisfied with your purchase, you can request a full refund within 30 days
          of your order date.
        </p>
      </section>
      <section>
        <h2>How to request a refund</h2>
        <p>
          Refunds are processed by our payment provider and Merchant of Record, Paddle. To request a refund, visit{" "}
          <a href="https://paddle.net" target="_blank" rel="noreferrer">paddle.net</a> and look up your order, or contact
          our support team (Barbie Burkett, The Command Suite) and we'll help you through the process.
        </p>
      </section>
      <section>
        <h2>Trials and cancellations</h2>
        <p>
          New accounts start with a 14-day free trial — you won't be charged if you cancel before the trial ends.
          You can cancel a paid subscription at any time; your access continues until the end of the current billing
          period, and the 30-day money-back guarantee above still applies to your most recent payment.
        </p>
      </section>
      <section>
        <h2>Questions</h2>
        <p>
          For any billing or refund question, contact <strong>Barbie Burkett</strong>, The Command Suite, or visit{" "}
          <a href="https://paddle.net" target="_blank" rel="noreferrer">paddle.net</a>.
        </p>
      </section>
    </LegalPage>
  );
}
