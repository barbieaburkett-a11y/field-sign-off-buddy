import { createFileRoute, Link } from "@tanstack/react-router";
import { HardHat, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegalFooter } from "@/components/LegalPage";

export const Route = createFileRoute("/support")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Support — FieldCO" },
      { name: "description", content: "Get help with FieldCO: your account, billing, template packs, or a change directive." },
      { property: "og:title", content: "Support — FieldCO" },
      { property: "og:description", content: "Get help with FieldCO: your account, billing, template packs, or a change directive." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Support,
});

function Support() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-heading">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"><HardHat className="h-5 w-5" /></span>
            FieldCO
          </Link>
          <Button variant="outline" asChild><Link to="/pricing">Plans & pricing</Link></Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">
        <h1 className="text-4xl font-extrabold text-heading">Support</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          FieldCO is run by The Command Suite — a small team, and a real person reads every message.
        </p>

        <div className="mt-8 rounded-lg border bg-card p-6 shadow-welcoming">
          <h2 className="flex items-center gap-2 text-lg font-bold text-heading"><Mail className="h-5 w-5 text-primary" /> Email us</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Write to <a href="mailto:hello@thecommandsuite.com" className="font-semibold text-accent-foreground underline">hello@thecommandsuite.com</a>. Email our support team for help with your account, directives, or purchases.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">It helps if you include:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>The email you signed up or purchased with</li>
            <li>The job name or directive number, if it's about a change directive</li>
            <li>A screenshot, if something looks wrong</li>
          </ul>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-card p-5">
            <h3 className="font-bold text-heading">Billing & refunds</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Cancel a paid plan from the billing portal in the app. Our <Link to="/refunds" className="text-accent-foreground underline">Refund Policy</Link> explains the 30-day money-back guarantee.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <h3 className="font-bold text-heading">Template packs</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Lost your download link? Email us from the address you bought with and we'll resend it. You can also <Link to="/my-templates" className="text-accent-foreground underline">sign in to see your packs</Link>.
            </p>
          </div>
        </div>
      </main>
      <LegalFooter />
    </div>
  );
}
