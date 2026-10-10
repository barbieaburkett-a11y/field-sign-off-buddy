import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, HardHat } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LegalFooter } from "@/components/LegalPage";
import { TemplateDoc } from "@/components/TemplateDoc";
import { DOCS, PACK_PRICE_ID, PACK_PRICE_LABEL, TRADES, type PackId } from "@/lib/template-packs";
import { openTemplateCheckout } from "@/lib/paddle";

const TITLE = "Construction Template Packs by Trade — Change Orders, Logs, Schedules | FieldCO";
const DESC = "Printable change order, change order log, work order, schedule, budget and workflow templates for electrical, plumbing & HVAC, concrete & framing, and drywall subs. $9.99 per trade.";

export const Route = createFileRoute("/templates/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Store,
});

function Store() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState<PackId | null>(null);
  const [previewTrade, setPreviewTrade] = useState(TRADES[0]!.id);
  const [previewDoc, setPreviewDoc] = useState<(typeof DOCS)[number]["id"]>(DOCS[0]!.id);

  const buy = async (pack: PackId) => {
    setBusy(pack);
    try {
      await openTemplateCheckout(PACK_PRICE_ID[pack], (txn) => navigate({ to: "/templates/thanks", search: { txn } }));
    } catch (e) {
      toast.error((e as Error).message ?? "Checkout couldn't open");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-heading">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"><HardHat className="h-5 w-5" /></span>
            FieldCO
          </Link>
          <Button variant="outline" asChild><Link to="/change-order-template">Free template</Link></Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-12">
        <h1 className="text-4xl font-extrabold leading-tight text-heading sm:text-5xl">Templates built for your trade</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Not ready for an app? Get printable paperwork made for the way your crew works. One-time purchase, no account needed — open your forms right away and we email you the link.
        </p>

        <div className="mt-8 rounded-lg border bg-card p-6 shadow-welcoming">
          <h2 className="text-lg font-bold text-heading">Every pack includes</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {DOCS.map((d) => <li key={d.id} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-success" />{d.name}</li>)}
          </ul>
        </div>

        <section className="mt-8 rounded-lg border bg-card p-6">
          <h2 className="text-lg font-bold text-heading">Preview the actual forms</h2>
          <p className="mt-1 text-sm text-muted-foreground">This is the real form from each pack, shown blank. Pick a trade and form to look inside.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <select aria-label="Trade" className="h-11 rounded-md border bg-background px-3" value={previewTrade} onChange={(e) => setPreviewTrade(e.target.value as typeof previewTrade)}>
              {TRADES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select aria-label="Form" className="h-11 rounded-md border bg-background px-3" value={previewDoc} onChange={(e) => setPreviewDoc(e.target.value as typeof previewDoc)}>
              {DOCS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="relative mt-4 max-h-[520px] overflow-hidden rounded-md border bg-background p-4" aria-label="Form preview">
            <div className="pointer-events-none select-none"><TemplateDoc trade={previewTrade} doc={previewDoc} /></div>
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-card to-transparent" />
            <span className="absolute right-3 top-3 rounded bg-accent px-2 py-1 font-mono text-xs font-bold text-accent-foreground">Preview</span>
          </div>
        </section>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {TRADES.map((t) => (
            <div key={t.id} className="flex flex-col rounded-lg border bg-card p-6">
              <h3 className="text-xl font-extrabold text-heading">{t.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">Line items pre-filled: {t.items.slice(0, 4).map((i) => i.replace(/ \(.*\)$/, "")).join(", ")}…</p>
              <div className="mt-4 flex items-end justify-between gap-3">
                <span className="text-3xl font-extrabold text-heading">{PACK_PRICE_LABEL[t.id]}</span>
                <Button variant="welcoming" disabled={busy !== null} onClick={() => buy(t.id)}>{busy === t.id ? "Opening…" : "Buy pack"}</Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-lg bg-secondary p-7 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-xl font-extrabold text-heading">All-trades bundle</h3>
            <p className="text-sm text-muted-foreground">All four packs, 28 templates — saves $10.96 versus buying separately.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-extrabold text-heading">{PACK_PRICE_LABEL.bundle}</span>
            <Button variant="welcoming" size="lg" disabled={busy !== null} onClick={() => buy("bundle")}>{busy === "bundle" ? "Opening…" : "Buy bundle"}</Button>
          </div>
        </div>

        <div className="mt-8 rounded-lg border bg-card p-6">
          <h2 className="text-lg font-bold text-heading">What you get</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><strong className="text-foreground">What you receive:</strong> browser-based forms (not downloadable files). Print or save your purchased forms as PDFs without an account. Sign in with your purchase email to edit and save forms online.</li>
            <li><strong className="text-foreground">Delivery:</strong> right after checkout you land on your forms page, and we email you a personal link so you can come back any time.</li>
            <li><strong className="text-foreground">Editing and saving:</strong> create a free FieldCO sign-in with the same email you bought with, open My templates, type into any form, name it and save. Come back later to edit, print or save as PDF. No app subscription needed.</li>
            <li><strong className="text-foreground">Lost your link?</strong> Sign in with your purchase email at My templates, or email support from that address and we'll resend it.</li>
            <li><strong className="text-foreground">One-time purchase:</strong> no subscription, no expiry.</li>
            <li><strong className="text-foreground">Questions?</strong> <Link to="/support" className="font-semibold text-accent-foreground underline">Contact support</Link> — email our team for help with your purchase.</li>
          </ul>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Rather skip the paper? <Link to="/auth" search={{ mode: "signup" }} className="font-semibold text-accent-foreground underline">Try FieldCO free</Link> — photos, price and the GC's signature on your phone.
        </p>
      </main>
      <LegalFooter />
    </div>
  );
}
