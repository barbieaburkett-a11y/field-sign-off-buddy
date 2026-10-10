import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CheckCircle2, HardHat, XCircle } from "lucide-react";
import { toast } from "sonner";
import { getApproval, submitApproval } from "@/lib/approval.functions";
import { Packet } from "@/components/Packet";
import { SignaturePad } from "@/components/SignaturePad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/approve/$token")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Review Change Directive — FieldCO" },
      { name: "description", content: "Review photos, scope, and price, then approve with your signature." },
      { property: "og:title", content: "Review Change Directive" },
      { property: "og:description", content: "Review photos, scope, and price, then approve with your signature." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Approve,
});

function Approve() {
  const { token } = Route.useParams();
  const fetchIt = useServerFn(getApproval);
  const submit = useServerFn(submitApproval);
  const { data: co, isLoading, refetch } = useQuery({ queryKey: ["approve", token], queryFn: () => fetchIt({ data: { token } }) });
  const [name, setName] = useState("");
  const [title, setTitle] = useState("Superintendent");
  const [sig, setSig] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [justResponded, setJustResponded] = useState<"approved" | "rejected" | null>(null);

  const send = async (decision: "approved" | "rejected") => {
    if (busy) return;
    setBusy(true);
    try {
      await submit({ data: { token, decision, signerName: name, signerTitle: title, signature: sig ?? undefined, reason: reason || undefined } });
      setJustResponded(decision);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen">
      <header className="no-print bg-ink text-ink-foreground">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-2 px-4 font-display font-bold">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground"><HardHat className="h-4 w-4" /></span>
          Change directive review
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6">
        {isLoading ? (
          <p className="py-10 text-center text-muted-foreground">Loading…</p>
        ) : !co ? (
          <p className="py-10 text-center text-muted-foreground">This link is invalid or has expired.</p>
        ) : (
          <>
            {co.status === "approved" && (
              <div className="no-print mb-4 rounded-xl bg-success p-5 text-success-foreground">
                <div className="flex items-center gap-2 font-bold"><CheckCircle2 /> {justResponded === "approved" ? "Thank you — your signature is recorded." : "Approved."}</div>
                <p className="mt-1 text-sm opacity-90">The subcontractor can see the signed directive right away. Use the button below to save or print your copy.</p>
              </div>
            )}
            {co.status === "rejected" && (
              <div className="no-print mb-4 rounded-xl bg-destructive p-5 text-destructive-foreground">
                <div className="flex items-center gap-2 font-bold"><XCircle /> {justResponded === "rejected" ? "Your requested changes were sent." : "Changes were requested on this directive."}</div>
                <p className="mt-1 text-sm opacity-90">The subcontractor can update the directive and send you a new link to review.</p>
              </div>
            )}
            <Packet co={{ ...co, amount: Number(co.amount) }} />
            {co.status === "pending" && (
              <section className="no-print mt-5 space-y-3 rounded-xl border bg-card p-5">
                <h2 className="font-display text-lg font-bold">Your response</h2>
                <p className="text-sm text-muted-foreground">
                  Approving means you authorize the subcontractor to do the work described above for the stated lump-sum price.
                  It does not change the main contract or guarantee payment terms — it records that the extra work and its price were reviewed and accepted.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Input className="h-11" placeholder="Full name" aria-label="Your full name" value={name} onChange={(e) => setName(e.target.value)} />
                  <Input className="h-11" placeholder="Title" aria-label="Your title or company" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                {!rejecting ? (
                  <>
                    <SignaturePad onChange={setSig} />
                    <Button className="h-12 w-full" disabled={!name.trim() || !sig || busy} onClick={() => send("approved")}>{busy ? "Sending…" : "Approve & sign"}</Button>
                    <button className="w-full text-sm text-muted-foreground underline" onClick={() => setRejecting(true)}>Something off? Request changes</button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Tell the subcontractor what to fix — a price, the scope, missing photos. They can update the directive and send you a fresh link.</p>
                    <Textarea placeholder="What should change? (optional but helpful)" aria-label="What should change" value={reason} onChange={(e) => setReason(e.target.value)} />
                    <Button variant="destructive" className="h-12 w-full" disabled={!name.trim() || busy} onClick={() => send("rejected")}>{busy ? "Sending…" : "Request changes"}</Button>
                    <button className="w-full text-sm text-muted-foreground underline" onClick={() => setRejecting(false)}>Back to approve</button>
                  </>
                )}
              </section>
            )}
            {co.status !== "pending" && (
              <Button variant="outline" className="no-print mt-4 h-11 w-full" onClick={() => window.print()}>Print / Save PDF</Button>
            )}
          </>
        )}
      </main>
    </div>
  );
}
