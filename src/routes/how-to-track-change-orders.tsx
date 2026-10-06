import { createFileRoute } from "@tanstack/react-router";
import { GuidePage } from "@/components/GuidePage";

const TITLE = "How to track change orders in construction \u2014 FieldCO";
const DESCRIPTION = "Keep a clear change order log with status, proposed and approved amounts, deadlines, supporting records, and billing references.";
const URL = "https://approvefield.app/how-to-track-change-orders";

export const Route = createFileRoute("/how-to-track-change-orders")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: TITLE },
    { name: "description", content: DESCRIPTION },
    { property: "og:title", content: TITLE },
    { property: "og:description", content: DESCRIPTION },
    { property: "og:type", content: "article" },
    { property: "og:url", content: URL },
    { name: "twitter:card", content: "summary_large_image" },
  ], links: [{ rel: "canonical", href: URL }] }),
  component: Article,
});

function Article() {
  return <GuidePage title={"How to track change orders in construction"} intro={"Keep one job-by-job record of what changed, what is proposed, what is authorized, and what has been billed. A clean log connects the foreman\u2019s field records to the office\u2019s next pay application."} sections={[{"id": "log", "label": "Build your log"}, {"id": "status", "label": "Separate approval from billing"}, {"id": "routine", "label": "Follow a review routine"}, {"id": "example", "label": "Read a sample log"}, {"id": "fieldco", "label": "Tracking in FieldCO"}]} sources={[{"url": "https://help.aiacontracts.com/hc/en-us/articles/1500010255802-instructions-g701s-2017-change-order", "label": "AIA: G701S\u20132017 change order instructions"}, {"url": "https://esub.com/blog/change-order-management-for-trade-contractors-what-to-track-and-why-it-matters", "label": "eSUB: Change order management for trade contractors"}]}>

<section id="log"><h2>1. Build a change order log</h2><p>A spreadsheet can work for a small job if someone owns it and keeps it current. Give each change a unique reference and use it on the proposal, photos, emails, approvals, and pay application backup.</p><ul className="mt-4"><li>Job name, subcontract reference, change number, and short scope description.</li><li>Request date, requester, instruction or drawing reference, and location.</li><li>Notice deadline and required recipient, taken from your actual subcontract.</li><li>Proposal submission date, revision number, proposed addition or credit, and requested time adjustment.</li><li>Current approval status, reviewer, next action, and follow-up date.</li><li>Approved amount and time adjustment, authorized signer, approval date, and final change order number.</li><li>Links to photos, cost backup, correspondence, signatures, and billing records.</li></ul><p className="mt-4">Do not overwrite the history when a price changes. Preserve earlier submissions and identify which version is current.</p></section>
<section id="status"><h2>2. Separate approval status from billing status</h2><p>Draft, submitted, approved, and rejected tell you where authorization stands. Unbilled, billed, and paid tell you where the money stands. A change can be approved without being billed, and billed without being paid.</p><p>Keep proposed and approved totals separate. Treat credits consistently and do not count rejected proposals as approved revenue. If only part of a change is accepted, record exactly which scope and amount were approved rather than marking the whole proposal as accepted.</p><p>Also distinguish a signed field acknowledgment from the formal subcontract amendment where the project requires both. Keep the documents linked, but do not treat two references to the same work as two separate changes.</p></section>
<section id="routine"><h2>3. Use a repeatable review routine</h2><ol><li><strong>Record the field event promptly.</strong> Capture the instruction and condition photos while the facts are fresh; meet the contract’s notice requirements.</li><li><strong>Assign one next action.</strong> Name who needs to price, submit, review, revise, or follow up, and record a target date.</li><li><strong>Review open items regularly.</strong> Sort by notice deadline, age since submission, and next action rather than only by dollar amount.</li><li><strong>Reconcile before billing.</strong> Match approved changes to the subcontract total and the GC’s pay application requirements. Confirm the approved version is attached.</li><li><strong>Close the loop.</strong> Record the billing reference and later payment separately. Keep disputed or incomplete items visible.</li></ol><p className="mt-4">A practical weekly review can bring the foreman and office together around the same list. Increase the review frequency when deadlines or changing site conditions require it.</p></section>
<section id="example"><h2>4. Sample entries: what needs attention?</h2><p className="text-sm text-muted-foreground">Fictional entries for illustration, not customer records or price guidance.</p><dl className="mt-4 divide-y border-y [&_div]:py-4 [&_dt]:font-bold"><div><dt>CD-001 · Added receptacles · Pending · $1,850 proposed</dt><dd>Next action: ask the authorized reviewer for a decision. Do not include this in the approved total.</dd></div><div><dt>CD-002 · Revised pipe route · Approved · $2,400</dt><dd>Next action: check the required subcontract amendment and include the approved backup with the next eligible billing.</dd></div><div><dt>CD-003 · Deleted finish work · Approved credit · $600</dt><dd>Next action: deduct the credit when reconciling the approved change total. In this example, the net approved adjustment is $1,800.</dd></div></dl></section>
<section id="fieldco"><h2>5. What you can track in FieldCO</h2><p>FieldCO keeps field change directives by job, date, dollar amount, and Draft, Pending Approval, Approved, or Rejected status. Capture photos, a scope description, and a lump-sum price, then collect on-screen sign-off or remote approval by text on eligible plans.</p><p>Export the signed packet for pay application backup. Keep formal subcontract amendments, detailed cost breakdowns, notice deadlines, and billed or paid tracking in your office records where needed. FieldCO is not a full accounting system.</p></section>

  </GuidePage>;
}
