import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Camera, Check, Download, Printer, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/lib/auth";
import { signedPhotoUrls, uploadPhoto } from "@/lib/photos";
import {
  buildCommandSuiteExport,
  estNumber,
  fetchEstimate,
  fetchItems,
  saveLineToLibrary,
  type EstimateLineRow,
} from "@/lib/estimates";
import {
  canMarkSent,
  describeMeasure,
  draftConcreteLines,
  estimateTotals,
  HONEST_LABEL,
  lineCost,
  summarize,
  unconfirmedCount,
  unitCost,
  type ConcreteMeasure,
} from "@/lib/estimate-engine";
import { SAMPLE_LABEL } from "@/lib/estimate-samples";
import { AppShell } from "@/components/AppShell";
import { EstimatePacket } from "@/components/EstimatePacket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { money } from "@/lib/format";
import { canWrite, hasFeature, usePlan } from "@/lib/plans";

export const Route = createFileRoute("/estimates/$id")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Photo Estimate — FieldCO" },
      { name: "description", content: "Measure, price, and confirm a photo estimate." },
      { property: "og:title", content: "Photo Estimate — FieldCO" },
      { property: "og:description", content: "Measure, price, and confirm a photo estimate." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EstimateDetail,
});

const EST_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  approved: "Approved",
};

const defaultMeasure: ConcreteMeasure = {
  type: "concrete",
  lengthFt: 10,
  widthFt: 10,
  thicknessIn: 4,
  demo: false,
  basePrep: true,
  finish: "broom",
  reinforcement: "mesh",
};

function EstimateDetail() {
  const { id } = Route.useParams();
  const { user } = useRequireAuth();
  const qc = useQueryClient();
  const { data: account } = usePlan(user?.id);
  const writable = canWrite(account);

  const { data, refetch } = useQuery({
    queryKey: ["estimate", id],
    enabled: !!user,
    queryFn: () => fetchEstimate(id),
  });
  const { data: items = [] } = useQuery({
    queryKey: ["estimate-items"],
    enabled: !!user,
    queryFn: fetchItems,
  });
  const { data: photoUrls = [] } = useQuery({
    queryKey: ["estimate-photos", id, data?.estimate.photos],
    enabled: !!data,
    queryFn: () => signedPhotoUrls(data!.estimate.photos),
  });

  const [lines, setLines] = useState<EstimateLineRow[]>([]);
  const [measure, setMeasure] = useState<ConcreteMeasure>(defaultMeasure);
  const [overhead, setOverhead] = useState(10);
  const [markup, setMarkup] = useState(20);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [view, setView] = useState<"internal" | "customer">("internal");
  const [libPick, setLibPick] = useState("");
  const [blank, setBlank] = useState({
    description: "",
    unit: "EA",
    quantity: "1",
    labor: "",
    material: "",
    equipment: "",
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data) return;
    setLines(data.lines);
    setOverhead(data.estimate.overhead_percent);
    setMarkup(data.estimate.markup_percent);
    setTitle(data.estimate.title);
    setNotes(data.estimate.site_notes);
    const m = data.estimate.measure as Partial<ConcreteMeasure>;
    if (m && m.type === "concrete") setMeasure({ ...defaultMeasure, ...m });
  }, [data]);

  const totals = useMemo(() => estimateTotals(lines, overhead, markup), [lines, overhead, markup]);
  const split = useMemo(() => summarize(lines), [lines]);
  const unconfirmed = unconfirmedCount(lines);
  const gateOpen = canMarkSent(lines);

  if (!user || !data)
    return (
      <AppShell>
        <p className="py-10 text-center text-muted-foreground">Loading…</p>
      </AppShell>
    );
  const est = data.estimate;

  const persistEstimate = async (patch: Record<string, unknown>) => {
    const { error } = await supabase
      .from("estimates")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      refetch();
    }
  };
  const persistLine = async (line: EstimateLineRow) => {
    const { error } = await supabase
      .from("estimate_lines")
      .update({
        description: line.description,
        unit: line.unit,
        quantity: line.quantity,
        labor: line.labor,
        material: line.material,
        equipment: line.equipment,
        status: line.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", line.id);
    if (error) {
      toast.error(error.message);
      refetch();
    }
  };
  const patchLine = (lineId: string, patch: Partial<EstimateLineRow>, persist = false) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== lineId) return l;
        const next = { ...l, ...patch };
        if (persist) void persistLine(next);
        return next;
      }),
    );
  };

  const draftFromMeasure = async () => {
    setBusy(true);
    try {
      const itemsByKey = new Map(items.map((i) => [i.sample_key, i]));
      const drafts = draftConcreteLines(measure, items);
      const rows = drafts.map((d, i) => ({
        estimate_id: id,
        item_id: d.itemKey ? (itemsByKey.get(d.itemKey)?.id ?? null) : null,
        description: d.description,
        unit: d.unit,
        quantity: d.quantity,
        labor: d.labor,
        material: d.material,
        equipment: d.equipment,
        status: "verify" as const,
        sort_order: lines.length + i,
      }));
      const { error } = await supabase.from("estimate_lines").insert(rows);
      if (error) throw error;
      await persistEstimate({ measure });
      toast.success(`${rows.length} lines drafted — every one needs your confirmation`);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not draft lines");
    } finally {
      setBusy(false);
    }
  };

  const addFromLibrary = async () => {
    const item = items.find((i) => i.id === libPick);
    if (!item) return;
    const priced = item.labor + item.material + item.equipment > 0;
    const { error } = await supabase.from("estimate_lines").insert({
      estimate_id: id,
      item_id: item.id,
      description: item.description,
      unit: item.unit,
      quantity: 1,
      labor: item.labor,
      material: item.material,
      equipment: item.equipment,
      status: priced ? "confirmed" : "verify",
      sort_order: lines.length,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setLibPick("");
    refetch();
  };

  const addBlankLine = async () => {
    if (!blank.description.trim()) {
      toast.error("Give the line a description");
      return;
    }
    const draft = {
      description: blank.description.trim(),
      unit: blank.unit.trim() || "EA",
      quantity: Number(blank.quantity) || 1,
      labor: Number(blank.labor) || 0,
      material: Number(blank.material) || 0,
      equipment: Number(blank.equipment) || 0,
    };
    try {
      // Saved back to the library so this line exists next time (spec §3).
      const item = await saveLineToLibrary(user.id, draft);
      const priced = draft.labor + draft.material + draft.equipment > 0;
      const { error } = await supabase.from("estimate_lines").insert({
        estimate_id: id,
        item_id: item.id,
        ...draft,
        status: priced ? "confirmed" : "verify",
        sort_order: lines.length,
      });
      if (error) throw error;
      setBlank({
        description: "",
        unit: "EA",
        quantity: "1",
        labor: "",
        material: "",
        equipment: "",
      });
      qc.invalidateQueries({ queryKey: ["estimate-items"] });
      toast.success("Line added and saved to your library");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add line");
    }
  };

  const removeLine = async (lineId: string) => {
    const { error } = await supabase.from("estimate_lines").delete().eq("id", lineId);
    if (error) {
      toast.error(error.message);
      return;
    }
    refetch();
  };

  const confirmAll = async () => {
    const { error } = await supabase
      .from("estimate_lines")
      .update({ status: "confirmed" })
      .eq("estimate_id", id)
      .eq("status", "verify");
    if (error) {
      toast.error(error.message);
      return;
    }
    refetch();
  };

  const setStatus = async (status: "sent" | "approved") => {
    if (!gateOpen) return;
    await persistEstimate({
      status,
      ...(status === "sent" ? { sent_at: new Date().toISOString() } : {}),
    });
    toast.success(status === "sent" ? "Marked as sent" : "Marked as approved");
    refetch();
    qc.invalidateQueries({ queryKey: ["estimates"] });
  };

  const addPhotos = async (files: File[]) => {
    try {
      const paths = await Promise.all(files.map((f) => uploadPhoto(user.id, f)));
      await persistEstimate({ photos: [...est.photos, ...paths] });
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add photos");
    }
  };

  const exportForCommandSuite = () => {
    const payload = buildCommandSuiteExport(est, lines);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${estNumber(est.number)}-for-command-suite.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.message(
      "Exported. The automatic Command Suite sync is the bridge step still to be built — this file is the exact payload it will send.",
    );
  };

  const num = (v: string) => (v === "" ? 0 : Number(v));

  return (
    <AppShell>
      <div className="no-print mb-4 flex items-center justify-between">
        <Link
          to="/estimates"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All estimates
        </Link>
        <span className="rounded-sm border border-current px-2.5 py-1 font-mono text-xs font-semibold">
          {EST_STATUS_LABEL[est.status]}
        </span>
      </div>

      <div className="no-print">
        <h1 className="text-2xl font-bold">{estNumber(est.number)}</h1>
        <p className="text-sm text-muted-foreground">
          {est.client_name || est.jobs?.name || "No customer yet"} · Quote total{" "}
          <span className="font-bold text-foreground">{money(totals.total)}</span>
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            variant={view === "internal" ? "default" : "outline"}
            className="h-11"
            onClick={() => setView("internal")}
          >
            Your numbers
          </Button>
          <Button
            variant={view === "customer" ? "default" : "outline"}
            className="h-11"
            onClick={() => setView("customer")}
          >
            Customer view
          </Button>
        </div>
      </div>

      {view === "customer" ? (
        <>
          <div className="mt-5">
            <EstimatePacket
              est={{
                number: est.number,
                title,
                siteNotes: notes,
                scopeSummary:
                  est.measure && (est.measure as Partial<ConcreteMeasure>).type === "concrete"
                    ? describeMeasure(measure)
                    : "",
                clientName: est.client_name || est.jobs?.name || null,
                createdAt: est.created_at,
                status: est.status,
                photoUrls,
                lines,
                total: totals.total,
                unconfirmed,
                companyName: hasFeature(account, "custom_logo")
                  ? (account?.company_name ?? null)
                  : null,
                companyLogoUrl: hasFeature(account, "custom_logo")
                  ? (account?.company_logo_url ?? null)
                  : null,
              }}
            />
          </div>
          <div className="no-print mt-4 grid grid-cols-2 gap-2 pb-10">
            <Button variant="outline" className="h-11" onClick={() => window.print()}>
              <Printer className="mr-1 h-4 w-4" /> Print / Save PDF
            </Button>
            <Button variant="outline" className="h-11" onClick={exportForCommandSuite}>
              <Download className="mr-1 h-4 w-4" /> Export for Command Suite
            </Button>
          </div>
        </>
      ) : (
        <div className="no-print mt-5 space-y-6 pb-10">
          <section>
            <Label htmlFor="t">Title</Label>
            <Input
              id="t"
              className="mt-1 h-11"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => persistEstimate({ title })}
              disabled={!writable}
            />
            <Label htmlFor="n" className="mt-4 block">
              Site notes — describe the project
            </Label>
            <Textarea
              id="n"
              rows={3}
              className="mt-1"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => persistEstimate({ site_notes: notes })}
              disabled={!writable}
            />
          </section>

          <section>
            <Label>Photos ({photoUrls.length})</Label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {photoUrls.map((u, i) => (
                <img
                  key={i}
                  src={u}
                  alt=""
                  className="aspect-square w-full rounded-lg border object-cover"
                />
              ))}
              {writable && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary">
                  <Camera className="h-7 w-7" />
                  <span className="mt-1 text-xs font-medium">Add photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const f = Array.from(e.target.files ?? []);
                      e.target.value = "";
                      if (f.length) addPhotos(f);
                    }}
                  />
                </label>
              )}
            </div>
          </section>

          <section className="rounded-xl border bg-card p-4">
            <h2 className="font-bold">Measure it — concrete</h2>
            <p className="mt-1 text-xs text-muted-foreground">{HONEST_LABEL}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div>
                <Label>Length (ft)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  className="mt-1 h-11"
                  value={measure.lengthFt}
                  onChange={(e) => setMeasure({ ...measure, lengthFt: num(e.target.value) })}
                />
              </div>
              <div>
                <Label>Width (ft)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  className="mt-1 h-11"
                  value={measure.widthFt}
                  onChange={(e) => setMeasure({ ...measure, widthFt: num(e.target.value) })}
                />
              </div>
              <div>
                <Label>Thickness (in)</Label>
                <select
                  className="mt-1 h-11 w-full rounded-md border bg-card px-3"
                  value={measure.thicknessIn}
                  onChange={(e) => setMeasure({ ...measure, thicknessIn: Number(e.target.value) })}
                >
                  <option value={4}>4 in</option>
                  <option value={5}>5 in</option>
                  <option value={6}>6 in</option>
                </select>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <Label>Finish</Label>
                <select
                  className="mt-1 h-11 w-full rounded-md border bg-card px-3"
                  value={measure.finish}
                  onChange={(e) =>
                    setMeasure({ ...measure, finish: e.target.value as ConcreteMeasure["finish"] })
                  }
                >
                  <option value="broom">Broom</option>
                  <option value="smooth">Smooth trowel</option>
                  <option value="stamped">Stamped</option>
                  <option value="exposed">Exposed aggregate</option>
                </select>
              </div>
              <div>
                <Label>Reinforcement</Label>
                <select
                  className="mt-1 h-11 w-full rounded-md border bg-card px-3"
                  value={measure.reinforcement}
                  onChange={(e) =>
                    setMeasure({
                      ...measure,
                      reinforcement: e.target.value as ConcreteMeasure["reinforcement"],
                    })
                  }
                >
                  <option value="none">None</option>
                  <option value="mesh">Wire mesh</option>
                  <option value="rebar">Rebar grid</option>
                </select>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={measure.demo}
                  onChange={(e) => setMeasure({ ...measure, demo: e.target.checked })}
                />{" "}
                Tear out old concrete
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={measure.basePrep}
                  onChange={(e) => setMeasure({ ...measure, basePrep: e.target.checked })}
                />{" "}
                Gravel base prep
              </label>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{describeMeasure(measure)}</p>
            <Button
              className="mt-3 h-11 w-full"
              onClick={draftFromMeasure}
              disabled={busy || !writable}
            >
              {busy ? "Drafting…" : "Draft lines from these measurements"}
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Lines are priced from your library and every one starts as VERIFY — you confirm them
              below.
            </p>
          </section>

          <section>
            <div className="flex items-baseline justify-between">
              <h2 className="font-bold">Lines</h2>
              {unconfirmed > 0 && (
                <span className="font-mono text-xs text-primary">{unconfirmed} to verify</span>
              )}
            </div>
            <div className="mt-2 space-y-2">
              {lines.map((l) => (
                <div key={l.id} className="rounded-lg border bg-card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <Input
                      className="h-9 font-medium"
                      value={l.description}
                      onChange={(e) => patchLine(l.id, { description: e.target.value })}
                      onBlur={() => persistLine(l)}
                      disabled={!writable}
                    />
                    {l.status === "verify" ? (
                      <span className="mt-1 shrink-0 rounded-sm bg-warning px-2 py-0.5 font-mono text-[11px] font-bold text-warning-foreground">
                        VERIFY
                      </span>
                    ) : (
                      <span className="mt-1 shrink-0 rounded-sm bg-success px-2 py-0.5 font-mono text-[11px] font-bold text-success-foreground">
                        CONFIRMED
                      </span>
                    )}
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                    <label>
                      Qty
                      <Input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.25"
                        className="mt-0.5 h-9"
                        value={l.quantity}
                        onChange={(e) => patchLine(l.id, { quantity: num(e.target.value) })}
                        onBlur={() => persistLine(l)}
                        disabled={!writable}
                      />
                    </label>
                    <label>
                      Labor $
                      <Input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        className="mt-0.5 h-9"
                        value={l.labor}
                        onChange={(e) => patchLine(l.id, { labor: num(e.target.value) })}
                        onBlur={() => persistLine(l)}
                        disabled={!writable}
                      />
                    </label>
                    <label>
                      Material $
                      <Input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        className="mt-0.5 h-9"
                        value={l.material}
                        onChange={(e) => patchLine(l.id, { material: num(e.target.value) })}
                        onBlur={() => persistLine(l)}
                        disabled={!writable}
                      />
                    </label>
                    <label>
                      Equip $
                      <Input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        className="mt-0.5 h-9"
                        value={l.equipment}
                        onChange={(e) => patchLine(l.id, { equipment: num(e.target.value) })}
                        onBlur={() => persistLine(l)}
                        disabled={!writable}
                      />
                    </label>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm tabular-nums">
                      {l.quantity} {l.unit} × {money(unitCost(l))} ={" "}
                      <strong>{money(lineCost(l))}</strong>
                    </span>
                    <span className="flex gap-1">
                      {l.status === "verify" && (
                        <Button
                          size="sm"
                          className="h-8"
                          onClick={() => patchLine(l.id, { status: "confirmed" }, true)}
                          disabled={!writable}
                        >
                          <Check className="mr-1 h-3.5 w-3.5" /> Confirm
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8"
                        onClick={() => removeLine(l.id)}
                        disabled={!writable}
                        aria-label="Delete line"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </span>
                  </div>
                </div>
              ))}
              {lines.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No lines yet — draft them from your measurements above, or add lines below.
                </p>
              )}
            </div>
            {unconfirmed > 0 && (
              <Button
                variant="outline"
                className="mt-2 h-10 w-full"
                onClick={confirmAll}
                disabled={!writable}
              >
                Confirm all lines
              </Button>
            )}

            {writable && (
              <div className="mt-4 space-y-3 rounded-lg border border-dashed p-3">
                <div className="flex gap-2">
                  <select
                    className="h-10 min-w-0 flex-1 rounded-md border bg-card px-2 text-sm"
                    value={libPick}
                    onChange={(e) => setLibPick(e.target.value)}
                  >
                    <option value="">Add from your library…</option>
                    {items.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.description} — {money(i.labor + i.material + i.equipment)}/{i.unit}
                        {i.is_sample ? ` (${SAMPLE_LABEL})` : ""}
                      </option>
                    ))}
                  </select>
                  <Button className="h-10" onClick={addFromLibrary} disabled={!libPick}>
                    Add
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    className="h-10"
                    placeholder="New line description"
                    value={blank.description}
                    onChange={(e) => setBlank({ ...blank, description: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      className="h-10"
                      placeholder="Qty"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.25"
                      value={blank.quantity}
                      onChange={(e) => setBlank({ ...blank, quantity: e.target.value })}
                    />
                    <Input
                      className="h-10"
                      placeholder="Unit (EA, SF…)"
                      value={blank.unit}
                      onChange={(e) => setBlank({ ...blank, unit: e.target.value })}
                    />
                  </div>
                  <Input
                    className="h-10"
                    placeholder="Labor $/unit"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={blank.labor}
                    onChange={(e) => setBlank({ ...blank, labor: e.target.value })}
                  />
                  <Input
                    className="h-10"
                    placeholder="Material $/unit"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={blank.material}
                    onChange={(e) => setBlank({ ...blank, material: e.target.value })}
                  />
                  <Input
                    className="h-10"
                    placeholder="Equipment $/unit"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={blank.equipment}
                    onChange={(e) => setBlank({ ...blank, equipment: e.target.value })}
                  />
                  <Button variant="secondary" className="h-10" onClick={addBlankLine}>
                    Add line (saves to library)
                  </Button>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-xl border bg-card p-4">
            <h2 className="font-bold">
              Your numbers{" "}
              <span className="text-xs font-normal text-muted-foreground">(only you see this)</span>
            </h2>
            <dl className="mt-3 space-y-1 text-sm tabular-nums">
              <div className="flex justify-between">
                <dt>Materials</dt>
                <dd>{money(split.material)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Labor</dt>
                <dd>{money(split.labor)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Equipment</dt>
                <dd>{money(split.equipment)}</dd>
              </div>
              <div className="flex justify-between border-t pt-1 font-semibold">
                <dt>Subtotal (your cost)</dt>
                <dd>{money(totals.subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Overhead %</dt>
                <dd>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.5"
                    className="h-8 w-20 text-right"
                    value={overhead}
                    onChange={(e) => setOverhead(num(e.target.value))}
                    onBlur={() => persistEstimate({ overhead_percent: overhead })}
                    disabled={!writable}
                  />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Overhead</dt>
                <dd>{money(totals.overhead)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Markup %</dt>
                <dd>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.5"
                    className="h-8 w-20 text-right"
                    value={markup}
                    onChange={(e) => setMarkup(num(e.target.value))}
                    onBlur={() => persistEstimate({ markup_percent: markup })}
                    disabled={!writable}
                  />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Profit (markup)</dt>
                <dd>{money(totals.markupAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Margin on price</dt>
                <dd>{totals.marginPercent.toFixed(1)}%</dd>
              </div>
              <div className="flex justify-between border-t pt-1 text-base font-extrabold">
                <dt>Quote total</dt>
                <dd>{money(totals.total)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-muted-foreground">
              Markup is what you add on top of cost; margin is the share of the final price that's
              profit. They are not the same number.
            </p>
          </section>

          <section>
            {!gateOpen && (
              <p className="mb-2 flex items-start gap-2 rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                {lines.length === 0
                  ? "Add at least one line before this estimate can be marked sent."
                  : `${unconfirmed} line${unconfirmed === 1 ? "" : "s"} still marked VERIFY. Confirm every line before this estimate can be marked sent or approved — and the customer copy stays stamped DRAFT until you do.`}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button
                className="h-12"
                disabled={!gateOpen || est.status !== "draft" || !writable}
                onClick={() => setStatus("sent")}
              >
                Mark as sent
              </Button>
              <Button
                variant="secondary"
                className="h-12"
                disabled={!gateOpen || est.status !== "sent" || !writable}
                onClick={() => setStatus("approved")}
              >
                Mark as approved
              </Button>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
