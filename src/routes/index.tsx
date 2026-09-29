import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/lib/auth";
import { AppShell, StatusBadge } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { coNumber, dateOnly, money, STATUS_LABEL, type Status } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — FieldCO Change Directives" },
      { name: "description", content: "Track every field change directive by job, status, date, and amount." },
      { property: "og:title", content: "FieldCO — Field Change Directives" },
      { property: "og:description", content: "Capture, sign, and track field change directives in minutes." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useRequireAuth();
  const [job, setJob] = useState("all");
  const [status, setStatus] = useState<"all" | Status>("all");

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
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-success p-4 text-success-foreground">
          <div className="text-xs font-medium uppercase opacity-80">Approved</div>
          <div className="mt-1 font-display text-2xl font-bold">{money(totals.approved)}</div>
        </div>
        <div className="rounded-xl bg-warning p-4 text-warning-foreground">
          <div className="text-xs font-medium uppercase opacity-80">Awaiting signature</div>
          <div className="mt-1 font-display text-2xl font-bold">{money(totals.pending)}</div>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <select className="h-10 flex-1 rounded-md border bg-card px-3 text-sm" value={job} onChange={(e) => setJob(e.target.value)}>
          <option value="all">All jobs</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>{j.name}</option>
          ))}
        </select>
        <select className="h-10 flex-1 rounded-md border bg-card px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value as Status | "all")}>
          <option value="all">All statuses</option>
          {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
      </div>

      <div className="mt-4 space-y-2 pb-24">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed p-10 text-center">
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
              className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary"
            >
              <div className="min-w-0">
                <div className="font-mono text-xs text-muted-foreground">
                  {coNumber(c.number)} · {c.jobs?.name} · {dateOnly(c.created_at)}
                </div>
                <div className="mt-0.5 truncate font-medium">{c.title}</div>
                <div className="mt-1.5"><StatusBadge status={c.status as Status} /></div>
              </div>
              <div className="shrink-0 font-display text-lg font-bold">{money(c.amount)}</div>
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
    </AppShell>
  );
}
