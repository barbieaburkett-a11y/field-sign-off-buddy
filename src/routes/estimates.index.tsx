import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Camera, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/lib/auth";
import { estNumber } from "@/lib/estimates";
import { estimateTotals } from "@/lib/estimate-engine";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { dateOnly, money } from "@/lib/format";

export const Route = createFileRoute("/estimates/")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Photo Estimates — FieldCO" },
      {
        name: "description",
        content: "Estimates that start from photos of the work and your own measurements.",
      },
      { property: "og:title", content: "Photo Estimates — FieldCO" },
      {
        property: "og:description",
        content: "Estimates that start from photos of the work and your own measurements.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EstimatesList,
});

const LABEL: Record<string, string> = { draft: "Draft", sent: "Sent", approved: "Approved" };

function EstimatesList() {
  const { user } = useRequireAuth();
  const { data: estimates = [], isLoading } = useQuery({
    queryKey: ["estimates"],
    enabled: !!user,
    queryFn: async () =>
      (
        await supabase
          .from("estimates")
          .select(
            "id,number,title,client_name,status,created_at,overhead_percent,markup_percent,jobs(name)",
          )
          .order("created_at", { ascending: false })
      ).data ?? [],
  });
  const { data: allLines = [] } = useQuery({
    queryKey: ["estimate-lines-all"],
    enabled: !!user,
    queryFn: async () =>
      (
        await supabase
          .from("estimate_lines")
          .select("estimate_id,quantity,labor,material,equipment,status")
      ).data ?? [],
  });

  const totalsById = useMemo(() => {
    const grouped = new Map<string, typeof allLines>();
    for (const l of allLines)
      grouped.set(l.estimate_id, [...(grouped.get(l.estimate_id) ?? []), l]);
    const out = new Map<string, number>();
    for (const e of estimates) {
      const ls = (grouped.get(e.id) ?? []).map((l) => ({
        ...l,
        quantity: Number(l.quantity),
        labor: Number(l.labor),
        material: Number(l.material),
        equipment: Number(l.equipment),
      }));
      out.set(e.id, estimateTotals(ls, Number(e.overhead_percent), Number(e.markup_percent)).total);
    }
    return out;
  }, [estimates, allLines]);

  if (!user) return null;

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b border-foreground pb-4">
        <h1 className="text-2xl font-extrabold">Photo estimates</h1>
        <span className="font-mono text-xs text-muted-foreground">{estimates.length} records</span>
      </div>

      <div className="divide-y border-b pb-24">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
        ) : estimates.length === 0 ? (
          <div className="py-12 text-center">
            <Camera className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-medium">No photo estimates yet</p>
            <p className="text-sm text-muted-foreground">
              Standing in front of small work? Snap it, measure it, price it — before you leave the
              driveway.
            </p>
          </div>
        ) : (
          estimates.map((e) => (
            <Link
              key={e.id}
              to="/estimates/$id"
              params={{ id: e.id }}
              className="flex flex-wrap items-center justify-between gap-3 py-5 transition-colors hover:bg-muted/60"
            >
              <div className="min-w-0">
                <div className="font-mono text-xs text-primary">
                  {estNumber(e.number)} · {dateOnly(e.created_at)}
                </div>
                <div className="mt-1 break-words text-lg font-bold">{e.title}</div>
                <div className="mt-0.5 break-words text-sm text-muted-foreground">
                  {e.client_name || e.jobs?.name || "—"}
                </div>
                <div className="mt-1.5">
                  <span className="inline-flex items-center rounded-sm border border-current px-2.5 py-1 font-mono text-xs font-semibold">
                    {LABEL[e.status] ?? e.status}
                  </span>
                </div>
              </div>
              <div className="font-display text-xl font-bold tabular-nums">
                {money(totalsById.get(e.id) ?? 0)}
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="no-print fixed inset-x-0 bottom-0 border-t bg-background/90 p-4 backdrop-blur">
        <div className="mx-auto max-w-3xl">
          <Button asChild className="h-12 w-full text-base">
            <Link to="/estimates/new">
              <Plus className="mr-1 h-5 w-5" /> New photo estimate
            </Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
