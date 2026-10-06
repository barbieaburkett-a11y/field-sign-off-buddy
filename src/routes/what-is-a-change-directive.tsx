import { createFileRoute } from "@tanstack/react-router";
import { GuidePage } from "@/components/GuidePage";

const TITLE = "What is a change directive in construction \u2014 FieldCO";
const DESCRIPTION = "Understand how a construction change directive differs from a change order, what to record, and how subcontractors should handle authorization.";
const URL = "https://approvefield.app/what-is-a-change-directive";

export const Route = createFileRoute("/what-is-a-change-directive")({
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
  return <GuidePage title={"What is a change directive in construction?"} intro={"A change directive is a written instruction to change the work. Depending on the contract, it may tell the contractor to proceed before the final price or schedule adjustment is agreed."} sections={[{"id": "meaning", "label": "What the term means"}, {"id": "difference", "label": "Directive vs. change order"}, {"id": "response", "label": "What to do when one arrives"}, {"id": "example", "label": "A field example"}, {"id": "questions", "label": "Common questions"}]} sources={[{"url": "https://learn.aiacontracts.com/articles/construction-change-directive-vs-change-order/", "label": "AIA Contract Documents: Construction Change Directive vs. Change Order"}]}>

<section id="meaning"><h2>What does a change directive mean?</h2><p>In the AIA contract framework, a Construction Change Directive is a formal mechanism for directing changed work before all parties agree on its effect on the contract sum or time. It is not simply another name for an agreed change order.</p><p>At the subcontract level, the GC may use a field instruction, work authorization, or another project-specific document. Read your subcontract to understand what that document authorizes, who may issue it, and how you must respond.</p></section>
<section id="difference"><h2>Change directive vs. change order</h2><dl className="divide-y border-y [&_div]:py-4 [&_dt]:font-bold"><div><dt>Change request or proposal</dt><dd>A request to evaluate changed work or submit a price. A proposal alone does not establish that the work is authorized.</dd></div><div><dt>Change directive</dt><dd>An instruction to change the work through the contract’s directive process. Price, time, or both may still be unresolved.</dd></div><div><dt>Change order</dt><dd>A written amendment recording agreed scope and adjustments to contract price and time, with the approvals the contract requires.</dd></div></dl><p className="mt-4">The document’s title is not enough. Check its actual terms and the signer’s authority. A superintendent’s acknowledgment of field conditions may be different from approval to amend the subcontract.</p></section>
<section id="response"><h2>What to do when you receive a directive</h2><ol><li><strong>Read the instruction against your scope.</strong> Identify the original requirement, the revision, and the exact location.</li><li><strong>Check authority and notice rules.</strong> Confirm the sender, required recipients, delivery method, and deadlines in your subcontract. Do not assume every contract uses the same notice window.</li><li><strong>Clarify unresolved terms in writing.</strong> Record whether price and schedule effects are agreed, proposed, or still being evaluated. Follow the contract’s process for reservations and disputed work.</li><li><strong>Keep contemporaneous backup.</strong> Save the written instruction, drawing revisions, photos, daily labor hours, materials, equipment, and relevant site conditions.</li><li><strong>Track the final agreement.</strong> Link the directive to its proposal and subsequent change order so the office can reconcile the authorization and billing.</li></ol><p className="mt-4">Some contracts require proceeding with a properly issued directive while terms are resolved. Do not treat “no agreed price” as an automatic right to stop work; get contract-specific advice when authority or payment is disputed.</p></section>
<section id="example"><h2>Example: added receptacles before the price is settled</h2><p>Imagine the GC issues a written instruction to add two receptacles to an office wall, but has not accepted your price. Record the instruction reference, location, added scope, pricing basis, and any access or sequencing impacts. Keep the cost records required by the subcontract as work proceeds.</p><p>When scope, price, and time are agreed, reference that same instruction in the formal change order. This is an illustrative scenario, not a customer record or a guarantee of payment.</p></section>
<section id="questions"><h2>Common questions</h2><h3>Is a signed FieldCO directive an AIA Construction Change Directive?</h3><p>No. FieldCO’s field records and free form are not AIA documents. They capture scope, a lump-sum price, photos, and sign-off; whether they meet your project’s authorization requirements depends on the contract and approval authority.</p><h3 className="mt-6">Does a directive guarantee payment?</h3><p>No form alone guarantees payment. Required notices, authorization, scope and pricing disputes, and billing requirements still matter.</p><h3 className="mt-6">What if the instruction is only verbal?</h3><p>Record who said what and when, then follow the required written confirmation and notice process promptly. Preserve the original facts rather than backdating an approval.</p></section>

  </GuidePage>;
}
