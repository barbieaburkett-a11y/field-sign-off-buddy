import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Copy, LockKeyhole, MessageSquare, PenLine, Printer, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/lib/auth";
import { signedPhotoUrls } from "@/lib/photos";
import { AppShell, StatusBadge } from "@/components/AppShell";
import { Packet } from "@/components/Packet";
import { SignaturePad } from "@/components/SignaturePad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { coNumber, money, type Status } from "@/lib/format";
import { canWrite, hasFeature, usePlan } from "@/lib/plans";
import { UpgradeDialog } from "@/components/UpgradeDialog";

export const Route = createFileRoute("/co/$id")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Change Directive — FieldCO" },
      { name: "description", content: "Review, sign, and export a field change directive." },
      { property: "og:title", content: "Change Directive — FieldCO" },
      { property: "og:description", content: "Review, sign, and export a field change directive." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CODetail,
});

function CODetail() {
  const { id } = Route.useParams();
  const { user } = useRequireAuth();
  const qc = useQueryClient();
  const [signOpen, setSignOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState<string | null>(null);
  const { data: account } = usePlan(user?.id);

  const { data: co, refetch } = useQuery({
    queryKey: ["co", id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("change_orders").select("*, jobs(name,gc_name,address)").eq("id", id).single();
      if (error) throw error;
      return { ...data, amount: Number(data.amount), photoUrls: await signedPhotoUrls(data.photos) };
    },
  });

  if (!user || !co) return <AppShell><p className="py-10 text-center text-muted-foreground">Loading…</p></AppShell>;

  const link = `${window.location.origin}/approve/${co.share_token}`;
  const phone = phoneDraft ?? co.gc_phone ?? "";
  const setPhone = setPhoneDraft;
  const savePhone = async () => {
    const v = phone.trim() || null;
    if (v !== (co.gc_phone ?? null)) await supabase.from("change_orders").update({ gc_phone: v }).eq("id", co.id);
  };
  const markSent = async () => {
    if (co.status === "draft") {
      await supabase.from("change_orders").update({ status: "pending", sent_at: new Date().toISOString() }).eq("id", co.id);
      refetch();
      qc.invalidateQueries({ queryKey: ["cos"] });
    }
  };
  const msg = `${coNumber(co.number)} – ${co.title} (${money(co.amount)}) on ${co.jobs?.name}. Please review & sign: ${link}`;
  const copy = async () => {
    await navigator.clipboard.writeText(link);
    toast.success("Approval link copied");
    markSent();
  };
  const email = () => {
    const body = `${msg}\n\nSigned packet available at the link above once approved.`;
    const cc = hasFeature(account, "office_cc") && account?.office_pm_email ? `cc=${encodeURIComponent(account.office_pm_email)}&` : "";
    window.location.href = `mailto:?${cc}subject=${encodeURIComponent(`Change Directive ${coNumber(co.number)} – ${co.jobs?.name}`)}&body=${encodeURIComponent(body)}`;
  };

  const open = (co.status === "draft" || co.status === "pending") && canWrite(account);

  return (
    <AppShell>
      <div className="no-print mb-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All directives
        </Link>
        <StatusBadge status={co.status as Status} />
      </div>

      {open && (
        <div className="no-print mb-5 rounded-xl bg-ink p-4 text-ink-foreground">
          <h2 className="font-display text-lg font-bold">Get it signed</h2>
          <p className="text-sm opacity-70">Hand your phone to the superintendent, or share the approval link yourself. If it isn't signed in 24 hours, we'll email you a reminder.</p>
          {hasFeature(account, "sms_routing") && (
            <Input type="tel" inputMode="tel" placeholder="Super's mobile number (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} onBlur={savePhone} className="mt-3 h-11 bg-card text-foreground" />
          )}
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Button className="h-12" onClick={() => setSignOpen(true)}>
              <PenLine className="mr-1 h-4 w-4" /> Sign on this device
            </Button>
            {hasFeature(account, "sms_routing") ? (
              <Button className="h-12" variant="secondary" asChild>
                <a href={`sms:${phone.replace(/[^\d+]/g, "")}?&body=${encodeURIComponent(msg)}`} onClick={() => { savePhone(); markSent(); }}>
                  <MessageSquare className="mr-1 h-4 w-4" /> Open a ready-to-send text
                </a>
              </Button>
            ) : (
              <Button className="h-12" variant="secondary" onClick={() => setUpgradeOpen(true)}>
                <LockKeyhole className="mr-1 h-4 w-4" /> One-tap text sharing (Pro)
              </Button>
            )}
          </div>
          {hasFeature(account, "sms_routing") && <p className="mt-2 text-xs opacity-70">This opens your phone's messaging app with the link filled in — you send it. FieldCO doesn't send or track the text. No texting on this device? Copy the link below.</p>}
          <button onClick={copy} className="mt-3 flex w-full items-center gap-2 rounded-md bg-ink-foreground/10 px-3 py-2 text-left text-xs">
            <Copy className="h-3.5 w-3.5 shrink-0" /> <span className="truncate font-mono">{link}</span>
          </button>
        </div>
      )}

      <Packet co={{ ...co, companyName: hasFeature(account, "custom_logo") ? (account?.company_name ?? null) : null, companyLogoUrl: hasFeature(account, "custom_logo") ? (account?.company_logo_url ?? null) : null }} />

      <div className="no-print mt-4 grid grid-cols-2 gap-2 pb-10">
        <Button variant="outline" className="h-11" onClick={() => window.print()}>
          <Printer className="mr-1 h-4 w-4" /> Print / Save PDF
        </Button>
        <Button variant="outline" className="h-11" onClick={email}>
          <Mail className="mr-1 h-4 w-4" /> Email packet
        </Button>
      </div>

      <OnSiteSign open={signOpen} onOpenChange={setSignOpen} coId={co.id} amount={co.amount} title={co.title} onDone={() => { refetch(); qc.invalidateQueries({ queryKey: ["cos"] }); }} />
      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} recommended="pro" reason="One-tap text sharing is included with Pro and Unlimited." />
    </AppShell>
  );
}

function OnSiteSign({ open, onOpenChange, coId, amount, title, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; coId: string; amount: number; title: string; onDone: () => void }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Superintendent");
  const [sig, setSig] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    const now = new Date().toISOString();
    const { error } = await supabase.from("change_orders").update({
      status: "approved", signer_name: name.trim(), signer_title: role.trim() || null, signature: sig,
      signed_method: "onsite", signed_at: now, updated_at: now,
    }).eq("id", coId);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Signed and approved");
    onOpenChange(false);
    onDone();
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Authorize change directive</DialogTitle></DialogHeader>
        <div className="rounded-lg bg-muted p-3">
          <div className="text-sm">{title}</div>
          <div className="font-display text-2xl font-bold">{money(amount)}</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input className="h-11" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input className="h-11" placeholder="Title" value={role} onChange={(e) => setRole(e.target.value)} />
        </div>
        {open && <SignaturePad onChange={setSig} />}
        <Button className="h-12" disabled={!name.trim() || !sig || busy} onClick={submit}>Approve & sign</Button>
      </DialogContent>
    </Dialog>
  );
}
