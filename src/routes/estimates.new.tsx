import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Camera, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/lib/auth";
import { uploadPhoto } from "@/lib/photos";
import { ensureSampleItems } from "@/lib/estimates";
import { HONEST_LABEL } from "@/lib/estimate-engine";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { canWrite, usePlan } from "@/lib/plans";

export const Route = createFileRoute("/estimates/new")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "New Photo Estimate — FieldCO" },
      {
        name: "description",
        content:
          "Start an estimate from photos of the work, add your measurements, and price it from your own library.",
      },
      { property: "og:title", content: "New Photo Estimate — FieldCO" },
      {
        property: "og:description",
        content:
          "Start an estimate from photos of the work, add your measurements, and price it from your own library.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewEstimate,
});

function NewEstimate() {
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
  const [client, setClient] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  // First run with an empty library: seed the SAMPLE starter items (labeled in the product).
  useEffect(() => {
    if (!user) return;
    ensureSampleItems(user.id).catch(() => {
      /* library still works empty; user can add lines by hand */
    });
  }, [user]);

  const { data: account } = usePlan(user?.id);
  if (!user) return null;
  if (account && !canWrite(account))
    return (
      <AppShell>
        <h1 className="text-2xl font-bold">New photo estimate</h1>
        <p className="mt-3 text-sm text-muted-foreground">Choose a plan to create new estimates.</p>
      </AppShell>
    );
  const addingJob = jobId === "__new";

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      let jid: string | null = jobId && jobId !== "__new" ? jobId : null;
      if (addingJob) {
        if (!newJob.trim()) throw new Error("Enter a job name, or pick an existing job");
        const { data, error } = await supabase
          .from("jobs")
          .insert({ name: newJob.trim() })
          .select("id")
          .single();
        if (error) throw error;
        jid = data.id;
      }
      const photos = await Promise.all(files.map((f) => uploadPhoto(user.id, f)));
      const { data, error } = await supabase
        .from("estimates")
        .insert({
          job_id: jid,
          client_name: client.trim() || null,
          title: title.trim() || "Photo estimate",
          site_notes: notes.trim(),
          photos,
          source: "fieldco-photo",
        })
        .select("id")
        .single();
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["estimates"] });
      navigate({ to: "/estimates/$id", params: { id: data.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <h1 className="text-2xl font-bold">New photo estimate</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Start with the work itself: photos first, then your measurements and prices.
      </p>
      <form onSubmit={save} className="mt-5 space-y-5 pb-10">
        <div>
          <Label>Photos of the work</Label>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {files.map((f, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg border">
                <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => setFiles(files.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 rounded-full bg-ink p-1 text-ink-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary">
              <Camera className="h-7 w-7" />
              <span className="mt-1 text-xs font-medium">Add photo</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="hidden"
                onChange={(e) => setFiles([...files, ...Array.from(e.target.files ?? [])])}
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{HONEST_LABEL}</p>
        </div>

        <div>
          <Label>Job (optional)</Label>
          {jobs.length > 0 ? (
            <select
              className="mt-1 h-11 w-full rounded-md border bg-card px-3"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
            >
              <option value="">No job — use a customer name</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.name}
                </option>
              ))}
              <option value="__new">+ Add new job</option>
            </select>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              No jobs yet — the customer name below is enough.
            </p>
          )}
          {addingJob && (
            <Input
              className="mt-2 h-11"
              placeholder="Job name (e.g. Miller porch)"
              value={newJob}
              onChange={(e) => setNewJob(e.target.value)}
            />
          )}
        </div>

        <div>
          <Label htmlFor="c">Customer name</Label>
          <Input
            id="c"
            className="mt-1 h-11"
            placeholder="Who is this estimate for?"
            value={client}
            onChange={(e) => setClient(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="t">What are you pricing?</Label>
          <Input
            id="t"
            className="mt-1 h-11"
            placeholder="e.g. Concrete patio, 20 × 20"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="n">Site notes — describe the project</Label>
          <Textarea
            id="n"
            rows={4}
            className="mt-1"
            placeholder="Access, condition, anything the photos don't show."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button type="submit" className="h-12 w-full text-base" disabled={busy}>
          {busy ? "Saving…" : "Save & price it"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Next: add your measurements and FieldCO drafts the lines from your price library. You
          confirm every line before anything can be sent.
        </p>
      </form>
    </AppShell>
  );
}
