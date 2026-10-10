import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HardHat, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegalFooter } from "@/components/LegalPage";
import fieldPhoto from "@/assets/field-electrical.jpg";
import { RelatedGuides } from "@/components/GuidePage";

const TITLE = "How to Write a Change Order in Construction — FieldCO";
const DESCRIPTION = "A practical guide for subcontractors: document changed scope, price extra work, record schedule impacts, and get authorized approval. Includes a worked example and free form.";
const sections = [
  ["before-you-write", "Check the subcontract"],
  ["write-it", "Write the change order"],
  ["example", "See a worked example"],
  ["approval", "Get approval and keep backup"],
  ["questions", "Common questions"],
];

export const Route = createFileRoute("/how-to-write-a-change-order")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://approvefield.app/how-to-write-a-change-order" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://approvefield.app/how-to-write-a-change-order" }],
  }),
  component: ChangeOrderGuide,
});

function ChangeOrderGuide() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-heading"><HardHat className="h-6 w-6 text-success" />FieldCO</Link>
          <Button variant="outline" size="sm" asChild><Link to="/change-order-template">Free form</Link></Button>
        </div>
      </header>
      <main className="flex-1">
        <div className="border-b bg-secondary">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
            <p className="font-mono text-xs uppercase text-success">Field notes / Subcontractor guide</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight text-heading sm:text-5xl">How to write a change order in construction</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed">Write down what changed, what it costs, and what it does to the schedule. Then get the approval your subcontract requires, with the supporting records attached.</p>
            <p className="mt-5 font-mono text-xs text-muted-foreground">By FieldCO · Published October 6, 2026</p>
          </div>
        </div>
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          <aside className="no-print">
            <nav aria-label="In this guide" className="lg:sticky lg:top-8">
              <p className="font-mono text-xs font-semibold uppercase text-success">In this guide</p>
              <ol className="mt-4 space-y-3 text-sm">{sections.map(([id, label], i) => <li key={id}><a href={`#${id}`} className="flex gap-3 text-muted-foreground hover:text-foreground hover:underline"><span className="font-mono text-success">0{i + 1}</span>{label}</a></li>)}</ol>
              <Button variant="ghost" size="sm" className="mt-6" onClick={() => window.print()}><Printer className="h-4 w-4" />Print guide</Button>
            </nav>
          </aside>
          <article className="min-w-0 max-w-3xl space-y-10 text-base leading-relaxed [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-heading [&_h3]:mb-2 [&_h3]:font-bold [&_p+p]:mt-4 [&_section]:scroll-mt-6">
            <section>
              <h2>What is a construction change order?</h2>
              <p>A change order records an agreed change to an existing contract: work added, removed, or revised, along with any adjustment to the price and completion time. For a subcontractor, it connects the extra work in the field to the subcontract with the general contractor.</p>
              <p>A request for a price is not the same as an approved change order. Keep proposed work separate from authorized work so your crew and office know what has actually been agreed.</p>
            </section>
            <section id="before-you-write">
              <h2>1. Check the subcontract before you write</h2>
              <p>Look for the change procedure, written-notice deadline, required form, pricing rules, and who can authorize a change. Follow the required delivery method and recipients. A signature from someone on site may not satisfy the contract if that person lacks authority.</p>
              <p>If the GC directs you to proceed before the price is agreed, follow the contract’s directive and notice process. Record the instruction and track labor, materials, equipment, and time as the work happens. Do not assume that a casual “go ahead” settles payment.</p>
            </section>
            <section id="write-it">
              <h2>2. Write the change order in six parts</h2>
              <ol className="space-y-6">
                <li><h3>A. Identify the job and document</h3><p>Include the project name and location, GC and subcontractor names, date, subcontract reference, and a unique change order number. Name the person who requested the change and reference the relevant instruction, RFI, or revised drawing.</p></li>
                <li><h3>B. Explain the changed condition</h3><p>State what was originally included and what is different now. Be specific about where the change occurs and why the work falls outside the original scope. Attach the relevant photos, drawing revision, or written request.</p></li>
                <li><h3>C. Define the added or deleted work</h3><p>Use measurable quantities, locations, materials, and tasks. “Additional electrical work” is vague; “Install two additional duplex receptacles on the east office wall, including conduit, conductors, connections, and testing” gives the reviewer something concrete to approve. List exclusions and assumptions, too.</p></li>
                <li><h3>D. State the price clearly</h3><p>Say whether the change is an addition or a credit and identify the agreed pricing basis. For a lump-sum request, show the total and keep the labor, material, equipment, and contract-permitted markup backup. If the required form asks for the original subcontract amount, previous approved changes, and revised total, include those figures.</p></li>
                <li><h3>E. Record the schedule impact</h3><p>State the requested increase or decrease in contract time and any affected completion date. Write “no adjustment requested” only when that is accurate. If the impact is still being evaluated, say so and follow the contract’s process for addressing it; do not guess at zero days.</p></li>
                <li><h3>F. Provide approval fields</h3><p>Include the names, titles, signatures, and dates of the authorized parties required by the subcontract. Make sure the approval refers to the same scope, price, and time adjustment you submitted.</p></li>
              </ol>
            </section>
            <section id="example">
              <h2>3. Worked example: two added receptacles</h2>
              <figure className="mb-5"><img src={fieldPhoto} alt="Illustrative electrical conduit and receptacles on an unfinished wall" width={1600} height={704} loading="lazy" className="aspect-[16/7] w-full rounded-lg object-cover" /><figcaption className="mt-2 text-xs text-muted-foreground">Illustrative photo and fictional pricing; not a customer record or a cost estimate.</figcaption></figure>
              <dl className="divide-y border-y [&_div]:py-4 [&_dt]:mb-1 [&_dt]:font-mono [&_dt]:text-xs [&_dt]:uppercase [&_dt]:text-success">
                <div><dt>Reference</dt><dd>Sample CD-0001 · Electrical · East office wall</dd></div>
                <div><dt>Changed condition</dt><dd>The GC requests two duplex receptacles on the east office wall beyond the receptacles included in the original electrical scope.</dd></div>
                <div><dt>Scope</dt><dd>Furnish and install two additional duplex receptacles, boxes, conduit, and conductors; connect to the existing designated circuit and test. Assumes the circuit has adequate capacity and the wall remains accessible. Drywall repair and painting are excluded.</dd></div>
                <div><dt>Lump-sum addition</dt><dd className="text-xl font-bold tabular-nums">$1,850.00</dd></div>
                <div><dt>Schedule</dt><dd>No adjustment requested in this fictional example; assumes access during the planned electrical rough-in.</dd></div>
                <div><dt>Backup and approval</dt><dd>Attach the condition photo, written GC request, and price breakdown. Obtain the authorized approvals required by the subcontract before treating it as an agreed change.</dd></div>
              </dl>
            </section>
            <section id="approval">
              <h2>4. Get approval and keep the backup together</h2>
              <p>Send the scope, price, schedule request, and attachments as one clear package. If the reviewer changes a term, update the document and confirm agreement on the revised version. Keep a log of the number, submission date, amount, and approval status.</p>
              <p>For billing, retain the approved document, signatures, dates, photos, and cost backup. Reference the change order number on the pay application and follow the GC’s required billing format. A signed field record can support that process, but it does not replace additional contract-required approvals or forms.</p>
              <h3 className="mt-6">Before you send it</h3>
              <ul className="list-disc space-y-2 pl-5"><li>Can the reviewer tell exactly what is included and excluded?</li><li>Does the price match the scope and attached backup?</li><li>Is the time impact addressed without unsupported assumptions?</li><li>Are the required notice, recipients, and authorized signers covered?</li><li>Will the office be able to match this record to the job and billing?</li></ul>
            </section>
            <section id="questions" className="space-y-6">
              <h2>Common questions</h2>
              <div><h3>Is a change directive the same as a change order?</h3><p>Not necessarily. Depending on the contract, a directive can instruct work to proceed while price or time remains unresolved; a change order records agreed terms. FieldCO calls its field records “change directives.” Whether a signed record meets your project’s change order requirements depends on the contract and the signer’s authority.</p></div>
              <div><h3>Can I write a change order after the work is done?</h3><p>You can document work already performed, but late documentation does not cure missed notice or authorization requirements. Submit notices promptly and preserve contemporaneous records. For disputed work or missed deadlines, seek advice specific to your contract.</p></div>
              <div><h3>Do I need an AIA form?</h3><p>Use the form your contract requires. Some projects require a particular AIA document or a GC-specific form; others accept a simpler record. FieldCO’s free form is not an AIA document and is not a substitute where a specific form is required.</p></div>
            </section>
            <section className="border-t pt-6 text-sm text-muted-foreground">
              <h2>Sources and contract note</h2>
              <p>This guide draws on <a className="text-accent-foreground underline underline-offset-4" href="https://help.aiacontracts.com/hc/en-us/articles/1500010255802-instructions-g701s-2017-change-order" target="_blank" rel="noopener noreferrer">AIA’s G701S–2017 change order instructions</a>, which address scope, subcontract sum, time adjustments, and execution. The example above is original, not a reproduction of an AIA form.</p>
              <p>General information, not legal advice. Your subcontract, project requirements, and applicable law control; a form or signature alone does not guarantee payment.</p>
            </section>
            <section className="no-print border-t pt-8"><h2>More field notes</h2><RelatedGuides /></section>
          </article>
        </div>
        <section className="no-print border-t bg-secondary px-5 py-12 sm:px-8">
          <div className="mx-auto max-w-3xl"><h2 className="text-2xl font-bold text-heading">Put the next change in writing</h2><p className="mt-3 leading-relaxed">Start with the free printable form, or use FieldCO to capture photos, enter a scope and lump-sum price, collect sign-off on site or by text, and export a signed packet for your pay application.</p><div className="mt-6 flex flex-wrap gap-3"><Button variant="welcoming" asChild><Link to="/change-order-template">Get the free form<ArrowRight className="h-4 w-4" /></Link></Button><Button variant="outline" asChild><Link to="/auth" search={{ mode: "signup" }}>Try FieldCO free</Link></Button></div><p className="mt-5 text-sm text-muted-foreground">Prefer paper? <Link to="/templates" className="text-accent-foreground underline underline-offset-4">Browse trade-specific template packs</Link>.</p></div>
        </section>
      </main>
      <LegalFooter />
    </div>
  );
}