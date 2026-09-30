import { Link } from "@tanstack/react-router";
import { Camera, FileCheck2, HardHat, LayoutList, PenLine, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegalFooter } from "@/components/LegalPage";

const FEATURES = [
  { icon: Camera, title: "Capture in the field", body: "Pick the job, snap photos of the condition, describe the scope, and enter a lump-sum price — in under a minute." },
  { icon: PenLine, title: "Sign on the spot", body: "Hand your phone to the GC superintendent. They review scope and amount and sign right on screen." },
  { icon: Smartphone, title: "Remote approval by link", body: "Text a secure link. The super reviews photos, description, and price on their own phone and signs digitally." },
  { icon: LayoutList, title: "Track every directive", body: "See all change directives by job, status, date, and dollar amount — Draft, Pending, Approved, or Rejected." },
  { icon: FileCheck2, title: "Pay-app ready packets", body: "Export a clean signed packet with timestamps, photos, totals, and signatures for your monthly pay application." },
];

export function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-ink text-ink-foreground">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><HardHat className="h-5 w-5" /></span>
            FieldCO
          </Link>
          <nav className="flex items-center gap-2">
            <Button size="sm" variant="ghost" asChild><Link to="/pricing">Pricing</Link></Button>
            <Button size="sm" asChild><Link to="/auth">Sign in</Link></Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Get the extra work signed before you build it.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            FieldCO is the field change-order app for construction subcontractors. Foremen capture extra work with photos and a price, and the GC signs off on site or by text — so you get paid for every change.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild><Link to="/auth">Start 14-day free trial</Link></Button>
            <Button size="lg" variant="outline" asChild><Link to="/pricing">See plans & pricing</Link></Button>
          </div>
        </section>
        <section className="mx-auto grid max-w-5xl gap-4 px-4 pb-16 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border bg-card p-5">
              <Icon className="h-6 w-6 text-primary" />
              <h2 className="mt-3 font-display text-lg font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>
        <section className="border-t bg-muted/40">
          <div className="mx-auto max-w-3xl px-4 py-12 text-center">
            <h2 className="font-display text-2xl font-bold">Built for electrical, mechanical, plumbing, drywall, and every trade in between</h2>
            <p className="mt-3 text-muted-foreground">
              Stop losing money to verbal "just do it" directives. Plans start at $49/month with unlimited change directives.
            </p>
          </div>
        </section>
      </main>
      <LegalFooter />
    </div>
  );
}
