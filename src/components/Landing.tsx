import { Link } from "@tanstack/react-router";
import { Camera, FileCheck2, HardHat, LayoutList, PenLine, Smartphone, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegalFooter } from "@/components/LegalPage";
import fieldPhoto from "@/assets/field-electrical.jpg";
import { RelatedGuides } from "@/components/GuidePage";

const FEATURES = [
  { icon: Camera, title: "Capture in the field", body: "Pick the job, snap photos of the condition, describe the scope, and enter a lump-sum price." },
  { icon: PenLine, title: "Sign on the spot", body: "Hand your phone to the GC superintendent. They review the scope and amount and sign right on screen." },
  { icon: Smartphone, title: "Remote approval", body: "Text a secure link. The super reviews photos, description, and price on their own phone and signs digitally." },
  { icon: LayoutList, title: "Track every directive", body: "See every directive by job, status, date, and dollar amount. Know what is signed and what needs attention." },
  { icon: FileCheck2, title: "Pay-app ready", body: "Export a clean signed packet with timestamps, photos, totals, and signatures for your monthly pay application." },
];

export function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-heading">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-accent-foreground-foreground"><HardHat className="h-5 w-5" /></span>FieldCO
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6">
          <Button variant="ghost" size="sm" asChild><Link to="/pricing">Pricing</Link></Button>
          <Button variant="ink" asChild className="rounded-full"><Link to="/auth">Sign in</Link></Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-5 pb-14 pt-12 text-center sm:px-8 sm:pb-24 sm:pt-20">
          <p className="mb-8 font-mono text-xs uppercase text-muted-foreground">FieldCO / Field change directives</p>
          <h1 className="text-4xl font-extrabold text-heading leading-[1.05] sm:text-6xl lg:text-7xl">Get the extra work signed<br className="hidden sm:block" /> <span className="font-editorial font-normal italic text-accent-foreground">before</span> you build it.</h1>
          <p className="mx-auto mb-12 mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">Not another all-in-one jobsite platform. FieldCO turns a <span className="font-mono font-medium text-foreground">“just do it”</span> from the GC into a signed, priced change directive — on site or by text.</p>
          <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            <Button variant="welcoming" size="lg" asChild className="h-14 rounded-lg text-sm font-bold uppercase"><Link to="/auth" search={{ mode: "signup" }}>Start 14-day free trial</Link></Button>
            <Button variant="outline" size="lg" asChild className="h-14 rounded-lg border-input bg-card text-sm font-bold uppercase"><Link to="/pricing">See plans & pricing</Link></Button>
          </div>
          <p className="mt-6 font-mono text-xs leading-6 text-muted-foreground">No demo call. No sales rep. <Link to="/change-order-template" className="text-accent-foreground underline underline-offset-4">Grab our free printable template</Link> or <Link to="/templates" className="text-accent-foreground underline underline-offset-4">trade template packs</Link>.</p>
          <p className="mt-3 text-sm text-muted-foreground"><Link to="/how-to-write-a-change-order" className="underline underline-offset-4 hover:text-foreground">How to write a change order in construction <ArrowUpRight className="inline h-4 w-4" /></Link></p>
        </section>
        <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
          <div className="grid grid-cols-1 overflow-hidden rounded-lg border bg-card shadow-welcoming md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }, i) => (
              <div key={title} className="border-b border-r bg-card p-7 text-left transition-colors hover:bg-background sm:p-10">
                <div className="mb-12 flex items-center justify-between"><span className="rounded bg-accent px-2 py-1 font-mono text-xs font-bold text-accent-foreground">[ 0{i + 1} ]</span><Icon className="h-5 w-5 text-muted-foreground" /></div>
                <h2 className="text-lg font-bold uppercase text-heading">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
            <div className="flex flex-col justify-between bg-secondary p-7 sm:p-10">
              <p className="font-mono text-xs font-bold uppercase text-success">Every plan</p>
              <p className="mt-3 text-xl font-bold">Unlimited directives.<br />Fixed monthly cost.</p>
              <Link to="/pricing" className="mt-5 flex items-center gap-2 text-sm font-semibold text-accent-foreground">From $19.99/month <ArrowUpRight className="h-4 w-4" /></Link>
            </div>
          </div>
          <div className="mx-auto mt-24 max-w-6xl">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-lg font-bold uppercase text-heading">From field condition to priced scope</h2><span className="text-xs italic text-muted-foreground">Illustrative example · not a customer record</span></div>
            <div className="overflow-hidden rounded-lg border bg-card shadow-welcoming"><img src={fieldPhoto} alt="Illustrative electrical installation with conduit and receptacles on an unfinished wall" width={1600} height={704} loading="lazy" className="aspect-[16/7] w-full object-cover" />
            <div className="grid gap-6 p-6 sm:p-8 sm:grid-cols-[1fr_auto]">
              <div><p className="font-mono text-xs text-muted-foreground">SAMPLE CD-0001 / ELECTRICAL</p><h3 className="mt-2 text-2xl font-extrabold text-heading">Two additional wall receptacles</h3><p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">Provide conduit, wiring, and two receptacles outside the original scope. Review the condition photo and lump-sum price before signing.</p></div>
              <div className="sm:text-right"><p className="font-mono text-xs text-muted-foreground">LUMP-SUM TOTAL</p><p className="mt-2 text-4xl font-extrabold text-heading tabular-nums">$1,850.00</p><p className="mt-2 inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">Awaiting signature</p></div>
            </div></div>
          </div>
        </section>
        <section className="bg-ink px-5 py-16 text-ink-foreground sm:py-20">
          <div className="mx-auto max-w-4xl text-center"><h2 className="text-3xl font-extrabold uppercase sm:text-4xl">Built for every trade in the field</h2><p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-foreground/75">Keep extra work documented, priced, and signed — without adding another complicated system to your day.</p><div className="mt-8 flex flex-wrap justify-center gap-x-7 gap-y-3 font-mono text-xs uppercase"><span>Electrical</span><span>HVAC</span><span>Plumbing</span><span>Drywall</span><span>Concrete</span></div></div>
        </section>
        <section className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8"><h2 className="text-2xl font-bold text-heading">Field notes for subcontractors</h2><div className="mt-4"><RelatedGuides /></div></section>
      </main>
      <LegalFooter />
    </div>
  );
}
