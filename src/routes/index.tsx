import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Plus, Camera } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Landing } from "@/components/Landing";
import { AppShell, StatusBadge } from "@/components/AppShell";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import { Button } from "@/components/ui/button";
import { coNumber, dateOnly, money, STATUS_LABEL, type Status } from "@/lib/format";
import type { PlanId } from "@/lib/plans";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "FieldCO — Field Change Orders for Subcontractors" },
      { name: "description", content: "Capture extra work with photos and a price, get GC sign-off on site or by text, and export signed packets for pay apps." },
      { property: "og:title", content: "FieldCO — Field Change Orders for Subcontractors" },
      { property: "og:description", content: "Capture, sign, and track field change directives in minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { user, loading } = useAuth();
  if (loading || !user) return <Landing />;
  return <Dashboard />;
}

function Dashboard() {
  const { user } = useAuth();
  const [job, setJob] = useState("all");
  const [status, setStatus] = useState<"all" | Status>("all");
  const [upgrade, setUpgrade] = useState<PlanId | null>(null);

  useEffect(() => {
    if (!user) return;
    const pending = sessionStorage.getItem("fieldco.pendingPlan") as PlanId | null;
    if (!pending) return;
    sessionStorage.removeItem("fieldco.pendingPlan");
    if (pending === "starter") {
      toast.success("Your 14-day Pro trial is on — Starter kicks in when it ends.");
    } else {
      setUpgrade(pending);
    }
  }, [user]);

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs"],
    enabled: !!user,
    queryFn: async () => (await supabase.from("jobs").select("id,name").order("name")).data ?? [],
  });
  const { data: cos = [], isLoading } = useQuery({
    queryKey: ["cos"],
    enabled: !!user,
    queryFn: async () =>
      (
        await supabase
          .from("change_orders")
          .select("id,number,title,amount,status,created_at,job_id,jobs(name)")
          .order("created_at", { ascending: false })
      ).data ?? [],
  });

  const filtered = cos.filter((c) => (job === "all" || c.job_id === job) && (status === "all" || c.status === status));
  const totals = useMemo(() => {
    const t = { approved: 0, pending: 0 };
    for (const c of filtered) {
      if (c.status === "approved") t.approved += Number(c.amount);
      if (c.status === "pending") t.pending += Number(c.amount);
    }
    return t;
  }, [filtered]);

  if (!user) return null;

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b border-foreground pb-4">
        <h1 className="text-2xl font-extrabold">Change directives</h1>
        <span className="font-mono text-xs text-muted-foreground">{filtered.length} records</span>
      </div>
      <div className="grid grid-cols-1 border-y border-foreground min-[400px]:grid-cols-2">
        <div className="min-w-0 border-b border-border py-5 min-[400px]:border-b-0 min-[400px]:border-r min-[400px]:pr-4">
          <div className="font-mono text-xs font-medium uppercase text-success">Approved</div>
          <div className="mt-2 break-words font-display text-3xl font-extrabold tabular-nums">{money(totals.approved)}</div>
        </div>
        <div className="min-w-0 py-5 min-[400px]:pl-4">
          <div className="font-mono text-xs font-medium uppercase text-primary">Awaiting signature</div>
          <div className="mt-2 break-words font-display text-3xl font-extrabold tabular-nums">{money(totals.pending)}</div>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <select className="h-12 min-w-0 flex-1 rounded-sm border bg-card px-3 text-sm" aria-label="Filter by job" value={job} onChange={(e) => setJob(e.target.value)}>
          <option value="all">All jobs</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>{j.name}</option>
          ))}
        </select>
        <select className="h-12 min-w-0 flex-1 rounded-sm border bg-card px-3 text-sm" aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value as Status | "all")}>
          <option value="all">All statuses</option>
          {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
      </div>

      <div className="mt-4 divide-y border-b pb-24">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Camera className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-medium">No change directives yet</p>
            <p className="text-sm text-muted-foreground">Found extra work? Capture it before you start.</p>
          </div>
        ) : (
          filtered.map((c) => (
            <Link
              key={c.id}
              to="/co/$id"
              params={{ id: c.id }}
              className="flex flex-wrap items-center justify-between gap-3 py-5 transition-colors hover:bg-muted/60"
            >
              <div className="min-w-0">
                <div className="font-mono text-xs text-primary">{coNumber(c.number)} · {dateOnly(c.created_at)}</div>
                <div className="mt-1 break-words text-lg font-bold">{c.jobs?.name}</div>
                <div className="mt-0.5 break-words text-sm text-muted-foreground">{c.title}</div>
                <div className="mt-1.5"><StatusBadge status={c.status as Status} /></div>
              </div>
              <div className="font-display text-xl font-bold tabular-nums">{money(c.amount)}</div>
            </Link>
          ))
        )}
      </div>

      <div className="no-print fixed inset-x-0 bottom-0 border-t bg-background/90 p-4 backdrop-blur">
        <div className="mx-auto max-w-3xl">
          <Button asChild className="h-12 w-full text-base">
            <Link to="/new"><Plus className="mr-1 h-5 w-5" /> New change directive</Link>
          </Button>
        </div>
      </div>
      <UpgradeDialog open={upgrade !== null} onOpenChange={(open) => !open && setUpgrade(null)} recommended={upgrade ?? "pro"} />
    </AppShell>
  );
}
