import { Link } from "@tanstack/react-router";
import { Camera, FileCheck2, HardHat, LayoutList, PenLine, Smartphone, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegalFooter } from "@/components/LegalPage";
import fieldPhoto from "@/assets/field-electrical.jpg";

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
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between border-b px-5 py-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2 font-mono text-xl font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-primary-foreground"><HardHat className="h-5 w-5" /></span>FieldCO
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6">
          <Button variant="ghost" size="sm" asChild><Link to="/pricing">Pricing</Link></Button>
          <Button variant="ink" asChild className="rounded-sm"><Link to="/auth">Sign in</Link></Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-5 pb-14 pt-12 text-center sm:px-8 sm:pb-16 sm:pt-16">
          <p className="mb-6 font-mono text-xs uppercase text-muted-foreground">FieldCO / Field change directives</p>
          <h1 className="text-4xl font-extrabold leading-[1.08] sm:text-6xl lg:text-7xl">Get the extra work signed<br className="hidden sm:block" /> <span className="font-editorial italic text-primary">before</span> you build it.</h1>
          <p className="mx-auto mb-8 mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">Not another all-in-one jobsite platform. FieldCO turns a <span className="font-mono font-medium text-foreground">“just do it”</span> from the GC into a signed, priced change directive — on site or by text.</p>
          <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            <Button variant="stamped" size="lg" asChild className="h-12 rounded-none text-sm font-bold uppercase"><Link to="/auth">Start 14-day free trial</Link></Button>
            <Button variant="outline" size="lg" asChild className="h-12 rounded-none border-foreground text-sm font-bold uppercase"><Link to="/pricing">See plans & pricing</Link></Button>
          </div>
          <p className="mt-6 font-mono text-xs leading-6 text-muted-foreground">No demo call. No sales rep. <Link to="/change-order-template" className="text-primary underline underline-offset-4">Grab our free printable template.</Link></p>
        </section>
        <section className="mx-auto max-w-5xl px-5 pb-16 sm:px-8">
          <div className="grid grid-cols-1 border-l border-t border-foreground md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }, i) => (
              <div key={title} className="border-b border-r border-foreground bg-card p-7 text-left sm:p-8">
                <div className="mb-6 flex items-center justify-between"><span className="font-mono text-xs font-bold text-primary">[ 0{i + 1} ]</span><Icon className="h-5 w-5 text-muted-foreground" /></div>
                <h2 className="text-lg font-bold uppercase">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
            <div className="flex flex-col justify-center border-b border-r border-foreground bg-secondary p-7 sm:p-8">
              <p className="font-mono text-xs font-bold uppercase text-success">Every plan</p>
              <p className="mt-3 text-xl font-bold">Unlimited directives.<br />Fixed monthly cost.</p>
              <Link to="/pricing" className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">From $49/month <ArrowUpRight className="h-4 w-4" /></Link>
            </div>
          </div>
          <div className="mt-12 border-y border-foreground py-6">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-lg font-bold uppercase">From field condition to priced scope</h2><span className="font-mono text-xs text-muted-foreground">Illustrative example · not a customer record</span></div>
            <img src={fieldPhoto} alt="Illustrative electrical installation with conduit and receptacles on an unfinished wall" width={1600} height={704} loading="lazy" className="aspect-[16/7] w-full object-cover" />
            <div className="grid gap-5 pt-5 sm:grid-cols-[1fr_auto]">
              <div><p className="font-mono text-xs text-muted-foreground">SAMPLE CD-0001 / ELECTRICAL</p><h3 className="mt-2 text-lg font-semibold">Two additional wall receptacles</h3><p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">Provide conduit, wiring, and two receptacles outside the original scope. Review the condition photo and lump-sum price before signing.</p></div>
              <div className="sm:text-right"><p className="font-mono text-xs text-muted-foreground">LUMP-SUM TOTAL</p><p className="mt-2 text-3xl font-bold tabular-nums">$1,850.00</p><p className="mt-2 text-sm font-semibold text-primary">Awaiting signature</p></div>
            </div>
          </div>
        </section>
        <section className="bg-ink px-5 py-16 text-ink-foreground sm:py-20">
          <div className="mx-auto max-w-4xl text-center"><h2 className="text-3xl font-extrabold uppercase sm:text-4xl">Built for every trade in the field</h2><p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-foreground/75">Keep extra work documented, priced, and signed — without adding another complicated system to your day.</p><div className="mt-8 flex flex-wrap justify-center gap-x-7 gap-y-3 font-mono text-xs uppercase"><span>Electrical</span><span>HVAC</span><span>Plumbing</span><span>Drywall</span><span>Concrete</span></div></div>
        </section>
      </main>
      <LegalFooter />
    </div>
  );
}
