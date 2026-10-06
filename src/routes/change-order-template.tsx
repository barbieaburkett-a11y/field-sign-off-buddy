import { createFileRoute, Link } from "@tanstack/react-router";
import { HardHat, Printer, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegalFooter } from "@/components/LegalPage";

const TITLE = "Free Change Order Template for Subcontractors (Printable) — FieldCO";
const DESC = "Free printable construction change order form for subcontractors: job, scope, lump-sum price, and GC signature lines. Print it, or get it signed on your phone.";

export const Route = createFileRoute("/change-order-template")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TemplatePage,
});

const Line = ({ label, tall }: { label: string; tall?: boolean }) => (
  <div className="mt-4">
    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
    <div className={`border-b border-foreground/60 ${tall ? "h-28" : "h-8"}`} />
  </div>
);

function TemplatePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print border-b bg-ink text-ink-foreground">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><HardHat className="h-5 w-5" /></span>
            FieldCO
          </Link>
          <Button size="sm" asChild><Link to="/auth">Start free trial</Link></Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <div className="no-print">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Free change order template for subcontractors</h1>
          <p className="mt-3 text-muted-foreground">
            Print this form and get the GC's signature before you start extra work. It covers what most supers need to see: the job, what changed, the lump-sum price, and a signature with the date.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={() => window.print()}><Printer className="mr-1 h-4 w-4" /> Print or save as PDF</Button>
            <Button variant="outline" asChild><Link to="/auth"><Smartphone className="mr-1 h-4 w-4" /> Do it on your phone instead</Link></Button>
          </div>
        </div>

        <section className="mt-8 rounded-lg border bg-card p-6 print:border-0 print:p-0">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-bold">Field Change Directive</h2>
            <span className="text-sm">No. ________</span>
          </div>
          <div className="grid gap-x-6 sm:grid-cols-2">
            <Line label="Subcontractor" />
            <Line label="Date" />
            <Line label="Project / job name" />
            <Line label="General contractor" />
            <Line label="Location on site" />
            <Line label="Requested by (GC rep)" />
          </div>
          <Line label="Description of changed condition" tall />
          <Line label="Scope of extra work" tall />
          <div className="grid gap-x-6 sm:grid-cols-2">
            <Line label="Lump-sum price ($)" />
            <Line label="Schedule impact (days)" />
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            By signing, the general contractor authorizes the work above for the stated lump-sum price, to be added to the subcontract and billed on the next pay application.
          </p>
          <div className="grid gap-x-6 sm:grid-cols-2">
            <Line label="GC signature" />
            <Line label="Printed name & title" />
            <Line label="Subcontractor signature" />
            <Line label="Date signed" />
          </div>
        </section>

        <section className="no-print mt-10 rounded-xl bg-muted/50 p-6">
          <h2 className="font-display text-xl font-bold">Skip the paper</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            With FieldCO, foremen snap photos, enter the scope and price, and the super signs on the phone or by text. Every signed directive becomes a time-stamped packet ready for your monthly pay application. Try it free for 14 days, no demo call needed.
          </p>
          <Button className="mt-4" asChild><Link to="/auth">Start free trial</Link></Button>
        </section>
      </main>
      <div className="no-print"><LegalFooter /></div>
    </div>
  );
}
