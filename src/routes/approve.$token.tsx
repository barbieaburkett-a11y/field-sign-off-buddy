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

  const send = async (decision: "approved" | "rejected") => {
    setBusy(true);
    try {
      await submit({ data: { token, decision, signerName: name, signerTitle: title, signature: sig ?? undefined, reason: reason || undefined } });
      toast.success(decision === "approved" ? "Approved — thank you" : "Response sent");
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
              <div className="no-print mb-4 flex items-center gap-2 rounded-xl bg-success p-4 text-success-foreground"><CheckCircle2 /> Approved. You can print this page for your records.</div>
            )}
            {co.status === "rejected" && (
              <div className="no-print mb-4 flex items-center gap-2 rounded-xl bg-destructive p-4 text-destructive-foreground"><XCircle /> This directive was rejected.</div>
            )}
            <Packet co={{ ...co, amount: Number(co.amount) }} />
            {co.status === "pending" && (
              <section className="no-print mt-5 space-y-3 rounded-xl border bg-card p-5">
                <h2 className="font-display text-lg font-bold">Your response</h2>
                <div className="grid grid-cols-2 gap-2">
                  <Input className="h-11" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
                  <Input className="h-11" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                {!rejecting ? (
                  <>
                    <SignaturePad onChange={setSig} />
                    <Button className="h-12 w-full" disabled={!name.trim() || !sig || busy} onClick={() => send("approved")}>Approve & sign</Button>
                    <button className="w-full text-sm text-muted-foreground" onClick={() => setRejecting(true)}>Reject this directive</button>
                  </>
                ) : (
                  <>
                    <Textarea placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
                    <Button variant="destructive" className="h-12 w-full" disabled={!name.trim() || busy} onClick={() => send("rejected")}>Reject</Button>
                    <button className="w-full text-sm text-muted-foreground" onClick={() => setRejecting(false)}>Back to approve</button>
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
