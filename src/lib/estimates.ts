import { supabase } from "@/integrations/supabase/client";
import { SAMPLE_ITEMS } from "@/lib/estimate-samples";
import type { LineDraft } from "@/lib/estimate-engine";

export type EstimateItemRow = {
  id: string;
  sample_key: string | null;
  description: string;
  unit: string;
  labor: number;
  material: number;
  equipment: number;
  is_sample: boolean;
  active: boolean;
};

export type EstimateRow = {
  id: string;
  job_id: string | null;
  client_name: string | null;
  number: number;
  title: string;
  site_notes: string;
  photos: string[];
  measure: Record<string, unknown>;
  overhead_percent: number;
  markup_percent: number;
  status: "draft" | "sent" | "approved";
  source: string;
  sent_at: string | null;
  created_at: string;
  jobs?: { name: string; gc_name: string | null } | null;
};

export type EstimateLineRow = LineDraft & {
  id: string;
  estimate_id: string;
  item_id: string | null;
  status: "verify" | "confirmed";
  sort_order: number;
};

const num = (v: unknown) => Number(v ?? 0);

export async function fetchItems(): Promise<EstimateItemRow[]> {
  const { data, error } = await supabase
    .from("estimate_items")
    .select("id,sample_key,description,unit,labor,material,equipment,is_sample,active")
    .eq("active", true)
    .order("description");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    ...r,
    labor: num(r.labor),
    material: num(r.material),
    equipment: num(r.equipment),
  }));
}

/** Seed the SAMPLE starter library once, the first time a user opens Photo Estimate with an empty library. */
export async function ensureSampleItems(userId: string): Promise<void> {
  const { count, error } = await supabase
    .from("estimate_items")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  if ((count ?? 0) > 0) return;
  const { error: insErr } = await supabase.from("estimate_items").insert(
    SAMPLE_ITEMS.map((s) => ({
      user_id: userId,
      sample_key: s.sampleKey,
      description: s.description,
      unit: s.unit,
      labor: s.labor,
      material: s.material,
      equipment: s.equipment,
      is_sample: true,
    })),
  );
  if (insErr) throw insErr;
}

/** A line priced by hand (no library match) is saved back to the library so it exists next time. */
export async function saveLineToLibrary(
  userId: string,
  draft: LineDraft,
): Promise<EstimateItemRow> {
  const { data, error } = await supabase
    .from("estimate_items")
    .insert({
      user_id: userId,
      description: draft.description,
      unit: draft.unit,
      labor: draft.labor,
      material: draft.material,
      equipment: draft.equipment,
      is_sample: false,
    })
    .select("id,sample_key,description,unit,labor,material,equipment,is_sample,active")
    .single();
  if (error) throw error;
  return {
    ...data,
    sample_key: null,
    labor: num(data.labor),
    material: num(data.material),
    equipment: num(data.equipment),
  };
}

export async function fetchEstimate(
  id: string,
): Promise<{ estimate: EstimateRow; lines: EstimateLineRow[] }> {
  const { data, error } = await supabase
    .from("estimates")
    .select("*, jobs(name,gc_name)")
    .eq("id", id)
    .single();
  if (error) throw error;
  const { data: lineData, error: lineErr } = await supabase
    .from("estimate_lines")
    .select("*")
    .eq("estimate_id", id)
    .order("sort_order");
  if (lineErr) throw lineErr;
  const estimate: EstimateRow = {
    ...(data as EstimateRow),
    overhead_percent: num(data.overhead_percent),
    markup_percent: num(data.markup_percent),
    photos: data.photos ?? [],
    measure: (data.measure ?? {}) as Record<string, unknown>,
  };
  const lines: EstimateLineRow[] = (lineData ?? []).map((l) => ({
    id: l.id,
    estimate_id: l.estimate_id,
    item_id: l.item_id,
    description: l.description,
    unit: l.unit,
    quantity: num(l.quantity),
    labor: num(l.labor),
    material: num(l.material),
    equipment: num(l.equipment),
    status: l.status as "verify" | "confirmed",
    sort_order: l.sort_order,
  }));
  return { estimate, lines };
}

/**
 * TODO — The Command Suite bridge (Track A sync, spec §7):
 * A finished Photo Estimate must land in The Command Suite's Estimate Builder
 * (/command/estimates) as a Draft with source = 'fieldco-photo'. The two apps
 * use different databases/auth today, so there is NO live sync yet and this
 * function must not pretend otherwise. It produces the exact JSON payload the
 * future bridge will POST, so the FieldCo side is complete and testable; the
 * editor offers it as a file export ("Export for The Command Suite").
 * Bridge work remaining: shared tenant identity between approvefield.app and
 * thecommandsuite.com, then a POST endpoint on the TCS side that imports this
 * payload into its estimates/estimate_lines tables with source='fieldco-photo'.
 */
export function buildCommandSuiteExport(estimate: EstimateRow, lines: EstimateLineRow[]) {
  return {
    source: "fieldco-photo",
    exported_at: new Date().toISOString(),
    estimate: {
      title: estimate.title,
      client_name: estimate.client_name ?? estimate.jobs?.name ?? null,
      site_notes: estimate.site_notes,
      status: "draft",
      overhead_percent: estimate.overhead_percent,
      markup_percent: estimate.markup_percent,
      measure: estimate.measure,
      photo_count: estimate.photos.length,
    },
    lines: lines.map((l) => ({
      description: l.description,
      unit: l.unit,
      quantity: l.quantity,
      labor: l.labor,
      material: l.material,
      equipment: l.equipment,
      status: l.status === "confirmed" ? "confirmed" : "draft",
    })),
  };
}

export const estNumber = (n: number) => `EST-${String(n).padStart(4, "0")}`;
