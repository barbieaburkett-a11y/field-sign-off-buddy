import { Link } from "@tanstack/react-router";
import { HardHat, Printer, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LegalFooter } from "@/components/LegalPage";
import fieldPhoto from "@/assets/field-electrical.jpg";

export const GUIDE_LINKS = [
  { to: "/how-to-write-a-change-order", label: "How to write a change order" },
  { to: "/what-is-a-change-directive", label: "What is a change directive?" },
  { to: "/how-to-track-change-orders", label: "How to track change orders" },
  { to: "/how-to-write-a-construction-schedule", label: "How to write a construction schedule" },
] as const;

export function RelatedGuides() {
  return <nav aria-label="Construction guides" className="grid gap-3 sm:grid-cols-2">{GUIDE_LINKS.map(({ to, label }) => <Link key={to} to={to} className="flex items-center justify-between gap-3 border-b py-3 text-sm font-semibold text-success hover:underline">{label}<ArrowRight className="h-4 w-4 shrink-0" /></Link>)}</nav>;
}

export function GuidePage({ title, intro, sections, children, sources }: {
  title: string;
  intro: string;
  sections: { id: string; label: string }[];
  children: ReactNode;
  sources: { url: string; label: string }[];
}) {
  return <div className="flex min-h-screen flex-col">
    <header className="no-print border-b"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-5 sm:px-8"><Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-heading"><HardHat className="h-6 w-6 text-success" />FieldCO</Link><Button variant="outline" size="sm" asChild><Link to="/change-order-template">Free form</Link></Button></div></header>
    <main className="flex-1">
      <div className="border-b bg-secondary"><div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16"><p className="font-mono text-xs uppercase text-success">Field notes / Subcontractor guide</p><h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight text-heading sm:text-5xl">{title}</h1><p className="mt-6 max-w-2xl text-lg leading-relaxed">{intro}</p><p className="mt-5 font-mono text-xs text-muted-foreground">By FieldCO · Published October 6, 2026</p></div></div>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
        <aside className="no-print"><nav aria-label="In this guide" className="lg:sticky lg:top-8"><p className="font-mono text-xs font-semibold uppercase text-success">In this guide</p><ol className="mt-4 space-y-3 text-sm">{sections.map(({ id, label }, i) => <li key={id}><a href={`#${id}`} className="flex gap-3 text-muted-foreground hover:text-foreground hover:underline"><span className="font-mono text-success">0{i + 1}</span>{label}</a></li>)}</ol><Button variant="ghost" size="sm" className="mt-6" onClick={() => window.print()}><Printer className="h-4 w-4" />Print guide</Button></nav></aside>
        <article className="min-w-0 max-w-3xl space-y-10 text-base leading-relaxed [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-heading [&_h3]:mb-2 [&_h3]:font-bold [&_p+p]:mt-4 [&_section]:scroll-mt-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-3 [&_ol]:pl-5">
          {children}
          <figure><img src={fieldPhoto} alt="Illustrative electrical conduit and receptacles on an unfinished construction wall" width={1600} height={704} loading="lazy" className="aspect-[16/7] w-full rounded-lg object-cover" /><figcaption className="mt-2 text-xs text-muted-foreground">Illustrative field condition, not a customer record.</figcaption></figure>
          <section className="border-t pt-6"><h2>Sources and contract note</h2><p className="text-sm text-muted-foreground">General information, not legal advice. Follow your project’s contract, required notices, approval authority, and scheduling requirements.</p><ul className="mt-4 text-sm">{sources.map(({ url, label }) => <li key={url}><a href={url} target="_blank" rel="noopener noreferrer" className="text-success underline underline-offset-4">{label}</a></li>)}</ul></section>
          <section className="no-print border-t pt-8"><h2>More field notes</h2><RelatedGuides /></section>
          <section className="no-print border-t pt-8"><h2>Put the extra work in writing</h2><p>Use the free printable change directive form to record scope, price, schedule impact, and signatures. Or use FieldCO to capture photos, enter a lump-sum price, and request sign-off on site or by text.</p><div className="mt-5 flex flex-wrap gap-3"><Button variant="welcoming" asChild><Link to="/change-order-template">Get the free form<ArrowRight className="h-4 w-4" /></Link></Button><Button variant="outline" asChild><Link to="/auth">Try FieldCO free</Link></Button></div></section>
        </article>
      </div>
    </main><div className="no-print"><LegalFooter /></div>
  </div>;
}