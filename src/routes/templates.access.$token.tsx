import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateDoc } from "@/components/TemplateDoc";
import { getTemplateAccess } from "@/lib/templates.functions";
import { DOCS, TRADES, tradesForPacks, type DocId, type TradeId } from "@/lib/template-packs";

export const Route = createFileRoute("/templates/access/$token")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Your templates — FieldCO" }, { name: "robots", content: "noindex" }] }),
  loader: ({ params }) => getTemplateAccess({ data: { token: params.token } }).catch(() => null),
  errorComponent: () => <main className="p-8">Couldn't load your templates. Please use the link from your email.</main>,
  notFoundComponent: () => <main className="p-8">Not found.</main>,
  component: Access,
});

function Access() {
  const access = Route.useLoaderData();
  const trades = access ? tradesForPacks(access.packs) : [];
  const [trade, setTrade] = useState<TradeId | undefined>(trades[0]);
  const [doc, setDoc] = useState<DocId | "all">("all");

  if (!access || !trade) {
    return (
      <main className="mx-auto max-w-md p-8 text-center">
        <h1 className="text-2xl font-extrabold text-heading">Link not recognized</h1>
        <p className="mt-2 text-muted-foreground">Use the link in your purchase email, or <Link to="/templates" className="underline">see the packs</Link>.</p>
      </main>
    );
  }

  const shown = doc === "all" ? DOCS.map((d) => d.id) : [doc];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="no-print">
        <h1 className="text-3xl font-extrabold text-heading">Your templates</h1>
        <p className="mt-2 text-muted-foreground">Pick a trade and a form, then print or save as PDF. Bookmark this page — it's your personal access.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <select aria-label="Trade" className="h-12 rounded-md border bg-card px-3" value={trade} onChange={(e) => setTrade(e.target.value as TradeId)}>
            {trades.map((id) => <option key={id} value={id}>{TRADES.find((t) => t.id === id)!.name}</option>)}
          </select>
          <select aria-label="Form" className="h-12 rounded-md border bg-card px-3" value={doc} onChange={(e) => setDoc(e.target.value as DocId | "all")}>
            <option value="all">All 7 forms</option>
            {DOCS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <Button variant="welcoming" className="h-12" onClick={() => window.print()}><Printer className="mr-1 h-4 w-4" /> Print or save as PDF</Button>
        </div>
      </div>
      <div className="mt-8 space-y-8 print:mt-0 print:space-y-0">
        {shown.map((d) => <TemplateDoc key={d} trade={trade} doc={d} />)}
      </div>
    </main>
  );
}
