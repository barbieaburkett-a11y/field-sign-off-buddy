import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FilePlus, Printer, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { getMyPacks } from "@/lib/my-templates.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TemplateDoc } from "@/components/TemplateDoc";
import { LegalFooter } from "@/components/LegalPage";
import { DOCS, TRADES, tradesForPacks, type DocId, type TradeId } from "@/lib/template-packs";

export const Route = createFileRoute("/my-templates")({
  staticData: { sitemap: false },
  head: () => ({ meta: [
    { title: "My templates — FieldCO" },
    { name: "description", content: "Your purchased FieldCO trade packs and saved, filled-in forms." },
    { property: "og:title", content: "My templates — FieldCO" },
    { property: "og:description", content: "Your purchased FieldCO trade packs and saved, filled-in forms." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: MyTemplates,
});

type Saved = { id: string; trade: string; doc: string; title: string; values: Record<string, string>; updated_at: string };

function MyTemplates() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", search: { next: "/my-templates" } });
  }, [loading, session, navigate]);
  if (!session) return <main className="p-8 text-muted-foreground">Loading…</main>;
  return <Workspace userId={session.user.id} />;
}

function Workspace({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const fetchPacks = useServerFn(getMyPacks);
  const packsQ = useQuery({ queryKey: ["my-packs"], queryFn: () => fetchPacks() });
  const savedQ = useQuery({
    queryKey: ["saved-forms", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("saved_forms").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Saved[];
    },
  });
  const trades = useMemo(() => tradesForPacks(packsQ.data?.packs ?? []), [packsQ.data]);

  const [trade, setTrade] = useState<TradeId | undefined>();
  const [doc, setDoc] = useState<DocId>("change-order");
  const [editing, setEditing] = useState<{ id?: string; title: string; values: Record<string, string> } | null>(null);
  const [busy, setBusy] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!trade && trades[0]) setTrade(trades[0]); }, [trades, trade]);

  const startNew = () => {
    if (!trade) return;
    setEditing({ title: `${DOCS.find((d) => d.id === doc)!.name} — ${new Date().toLocaleDateString()}`, values: {} });
    setTimeout(() => editorRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };
  const open = (f: Saved) => {
    setTrade(f.trade as TradeId); setDoc(f.doc as DocId);
    setEditing({ id: f.id, title: f.title, values: f.values ?? {} });
    setTimeout(() => editorRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };
  const save = async () => {
    if (!editing || !trade) return;
    setBusy(true);
    const row = { trade, doc, title: editing.title.trim() || "Untitled form", values: editing.values, updated_at: new Date().toISOString() };
    const res = editing.id
      ? await supabase.from("saved_forms").update(row).eq("id", editing.id).select("id").single()
      : await supabase.from("saved_forms").insert(row).select("id").single();
    setBusy(false);
    if (res.error) { toast.error("Couldn't save the form."); return; }
    setEditing({ ...editing, id: res.data.id });
    qc.invalidateQueries({ queryKey: ["saved-forms", userId] });
    toast.success("Form saved");
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this saved form?")) return;
    await supabase.from("saved_forms").delete().eq("id", id);
    if (editing?.id === id) setEditing(null);
    qc.invalidateQueries({ queryKey: ["saved-forms", userId] });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="no-print">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-3xl font-extrabold text-heading">My templates</h1>
            <Link to="/" className="text-sm text-muted-foreground underline underline-offset-4">Home</Link>
          </div>

          {packsQ.isLoading ? <p className="mt-4 text-muted-foreground">Loading your packs…</p>
          : trades.length === 0 ? (
            <div className="mt-6 rounded-lg border bg-card p-6">
              <p className="font-semibold text-heading">No packs on this account yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">Packs show up here when they were bought with {packsQ.data?.email ?? "this account's email"}. Bought with a different email? Sign in with that one, or use the link from your purchase email.</p>
              <Button variant="welcoming" className="mt-4" asChild><Link to="/templates">See the packs</Link></Button>
            </div>
          ) : (<>
            <p className="mt-2 text-muted-foreground">Fill a form on screen, save it, and come back to edit or print any time.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <select aria-label="Trade" className="h-12 rounded-md border bg-card px-3" value={trade} onChange={(e) => setTrade(e.target.value as TradeId)}>
                {trades.map((id) => <option key={id} value={id}>{TRADES.find((t) => t.id === id)!.name}</option>)}
              </select>
              <select aria-label="Form" className="h-12 rounded-md border bg-card px-3" value={doc} onChange={(e) => setDoc(e.target.value as DocId)}>
                {DOCS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <Button variant="welcoming" className="h-12" onClick={startNew}><FilePlus className="mr-1 h-4 w-4" /> Start a new form</Button>
            </div>

            <h2 className="mt-10 text-xl font-bold text-heading">Saved forms</h2>
            {savedQ.data?.length ? (
              <ul className="mt-3 divide-y rounded-lg border bg-card">
                {savedQ.data.map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-3 p-4">
                    <button className="text-left" onClick={() => open(f)}>
                      <div className="font-semibold text-heading">{f.title}</div>
                      <div className="font-mono text-xs text-muted-foreground">{TRADES.find((t) => t.id === f.trade)?.name} · {DOCS.find((d) => d.id === f.doc)?.name} · {new Date(f.updated_at).toLocaleDateString()}</div>
                    </button>
                    <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => remove(f.id)}><Trash2 className="h-4 w-4" /></Button>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-2 text-sm text-muted-foreground">Nothing saved yet.</p>}
          </>)}
        </div>

        {editing && trade && (
          <div ref={editorRef} className="mt-10">
            <div className="no-print sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b bg-background py-3">
              <Input aria-label="Form name" className="h-11 max-w-xs" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              <Button variant="welcoming" className="h-11" disabled={busy} onClick={save}><Save className="mr-1 h-4 w-4" /> {busy ? "Saving…" : "Save"}</Button>
              <Button variant="outline" className="h-11" onClick={() => window.print()}><Printer className="mr-1 h-4 w-4" /> Print or PDF</Button>
              <Button variant="ghost" className="h-11" onClick={() => setEditing(null)}>Close</Button>
            </div>
            <div className="mt-4">
              <TemplateDoc trade={trade} doc={doc} values={editing.values} onChange={(values) => setEditing({ ...editing, values })} />
            </div>
          </div>
        )}
      </main>
      <div className="no-print"><LegalFooter /></div>
    </div>
  );
}
