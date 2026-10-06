import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Camera, Loader2, ScanText, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { scanDocument } from "@/lib/scan.functions";

async function shrinkImage(file: File, max = 1600): Promise<string> {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.85);
}
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/lib/auth";
import { uploadPhoto } from "@/lib/photos";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/new")({
  head: () => ({
    meta: [
      { title: "New Change Directive — FieldCO" },
      { name: "description", content: "Capture photos, scope, and a lump-sum price for extra field work." },
      { property: "og:title", content: "New Change Directive — FieldCO" },
      { property: "og:description", content: "Capture photos, scope, and a lump-sum price for extra field work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewCO,
});

function NewCO() {
  const { user } = useRequireAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs"],
    enabled: !!user,
    queryFn: async () => (await supabase.from("jobs").select("id,name").order("name")).data ?? [],
  });
  const [jobId, setJobId] = useState("");
  const [newJob, setNewJob] = useState("");
  const [gc, setGc] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [foreman, setForeman] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const runScan = useServerFn(scanDocument);

  if (!user) return null;
  const addingJob = jobId === "__new" || jobs.length === 0;

  const scan = async (file: File) => {
    setScanning(true);
    try {
      const image = await shrinkImage(file);
      const res = await runScan({ data: { image, jobs: jobs.map((j) => j.name) } });
      if (!res.ok) { toast.error(res.error); return; }
      const r = res.result;
      if (r.job_name) {
        const match = jobs.find((j) => j.name.toLowerCase() === r.job_name!.toLowerCase());
        if (match) setJobId(match.id);
        else { setJobId("__new"); setNewJob(r.job_name); }
      }
      if (r.title) setTitle(r.title);
      if (r.description) setDesc(r.description);
      if (r.amount != null) setAmount(String(r.amount));
      if (r.foreman_name && !foreman) setForeman(r.foreman_name);
      setFiles((prev) => [file, ...prev]);
      setScanned(true);
      if (r.amount == null) toast.message("Couldn't read a dollar amount — please enter it.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't read the photo");
    } finally {
      setScanning(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      let jid = jobId;
      if (addingJob) {
        if (!newJob.trim()) throw new Error("Enter a job name");
        const { data, error } = await supabase.from("jobs").insert({ name: newJob.trim(), gc_name: gc.trim() || null }).select("id").single();
        if (error) throw error;
        jid = data.id;
      }
      const photos = await Promise.all(files.map((f) => uploadPhoto(user.id, f)));
      const { data, error } = await supabase
        .from("change_orders")
        .insert({
          job_id: jid,
          title: title.trim(),
          description: desc.trim(),
          amount: Number(amount),
          photos,
          foreman_name: foreman.trim() || null,
        })
        .select("id")
        .single();
      if (error) throw error;
      qc.invalidateQueries();
      navigate({ to: "/co/$id", params: { id: data.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <h1 className="text-2xl font-bold">New change directive</h1>
      <label className={`mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-primary/40 bg-primary/5 p-4 ${scanning ? "pointer-events-none opacity-70" : "hover:bg-primary/10"}`}>
        {scanning ? <Loader2 className="h-6 w-6 shrink-0 animate-spin text-primary" /> : <ScanText className="h-6 w-6 shrink-0 text-primary" />}
        <div>
          <div className="font-semibold">{scanning ? "Reading your photo…" : "Fill from a photo"}</div>
          <div className="text-sm text-muted-foreground">Snap a field directive, GC mark-up, or invoice. You'll check everything before saving.</div>
        </div>
        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) scan(f); }} />
      </label>
      {scanned && (
        <p className="mt-2 rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground">
          Filled from your photo — please check the job, scope and amount before saving.
        </p>
      )}
      <form onSubmit={save} className="mt-5 space-y-5 pb-10">
        <div>
          <Label>Job</Label>
          {jobs.length > 0 && (
            <select required className="mt-1 h-11 w-full rounded-md border bg-card px-3" value={jobId} onChange={(e) => setJobId(e.target.value)}>
              <option value="" disabled>Select a job…</option>
              {jobs.map((j) => (<option key={j.id} value={j.id}>{j.name}</option>))}
              <option value="__new">+ Add new job</option>
            </select>
          )}
          {addingJob && (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <Input className="h-11" placeholder="Job name (e.g. Riverside Medical)" value={newJob} onChange={(e) => setNewJob(e.target.value)} />
              <Input className="h-11" placeholder="General contractor" value={gc} onChange={(e) => setGc(e.target.value)} />
            </div>
          )}
        </div>

        <div>
          <Label>Photos of the condition</Label>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {files.map((f, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg border">
                <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                <button type="button" aria-label="Remove photo" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-ink p-1 text-ink-foreground">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary">
              <Camera className="h-7 w-7" />
              <span className="mt-1 text-xs font-medium">Add photo</span>
              <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(e) => setFiles([...files, ...Array.from(e.target.files ?? [])])} />
            </label>
          </div>
        </div>

        <div>
          <Label htmlFor="t">Short title</Label>
          <Input id="t" required className="mt-1 h-11" placeholder="Reroute 2in conduit around new duct" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="d">Scope of work</Label>
          <Textarea id="d" rows={4} className="mt-1" placeholder="What changed, where, and what you'll do." value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="a">Lump sum ($)</Label>
            <Input id="a" required type="number" inputMode="decimal" min="0" step="0.01" className="mt-1 h-12 font-display text-xl font-bold" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="f">Foreman</Label>
            <Input id="f" className="mt-1 h-12" placeholder="Your name" value={foreman} onChange={(e) => setForeman(e.target.value)} />
          </div>
        </div>
        <Button type="submit" className="h-12 w-full text-base" disabled={busy}>
          {busy ? "Saving…" : "Save & get signature"}
        </Button>
      </form>
    </AppShell>
  );
}
