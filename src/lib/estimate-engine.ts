/**
 * Photo Estimate — pure math and rules.
 *
 * The concrete method reproduces Barbie's "How To Quote Concrete Jobs" guide
 * (2026-11-11) exactly:
 *   cubic yards = length(ft) x width(ft) x thickness(ft) / 27, then +10% waste,
 *   rounded UP to the nearest quarter yard to order.
 * Gravel base is figured like concrete (4 in, compacted) and converted at
 * 1 cubic yard of gravel ~ 1.4 tons, rounded up to the nearest half ton.
 *
 * Money model (also the guide's): line costs sum to a subtotal, overhead % is
 * added, then profit markup % is applied on (subtotal + overhead). Markup is
 * not margin: margin = profit / final price. Everything here is pure and
 * unit-tested in estimate-engine.test.ts.
 */

export type Split = { labor: number; material: number; equipment: number };

export type LineDraft = Split & {
  description: string;
  unit: string;
  quantity: number;
  itemKey?: string | null;
};

export type LineLike = Split & { quantity: number; status?: string };

export type ConcreteMeasure = {
  type: "concrete";
  lengthFt: number;
  widthFt: number;
  thicknessIn: number;
  demo: boolean;
  basePrep: boolean;
  finish: "broom" | "smooth" | "stamped" | "exposed";
  reinforcement: "none" | "mesh" | "rebar";
};

export const HONEST_LABEL = "FieldCo doesn't measure from photos. You measure it — we math it.";
export const DRAFT_STAMP = "DRAFT — contains lines that have not been confirmed";

/** Round half-up to 2 decimals (money). */
export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function concreteYards(lengthFt: number, widthFt: number, thicknessIn: number) {
  const raw = (lengthFt * widthFt * (thicknessIn / 12)) / 27;
  const withWaste = raw * 1.1;
  const order = Math.ceil(withWaste * 4) / 4;
  return { raw, withWaste, order };
}

export function gravelTons(lengthFt: number, widthFt: number, baseIn = 4) {
  const cy = (lengthFt * widthFt * (baseIn / 12)) / 27;
  return Math.ceil(cy * 1.4 * 2) / 2;
}

export const unitCost = (l: Split) => round2(l.labor + l.material + l.equipment);
export const lineCost = (l: LineLike) => round2(l.quantity * unitCost(l));

export function summarize(lines: LineLike[]): Split & { subtotal: number } {
  const s: Split = { labor: 0, material: 0, equipment: 0 };
  for (const l of lines) {
    s.labor += l.quantity * l.labor;
    s.material += l.quantity * l.material;
    s.equipment += l.quantity * l.equipment;
  }
  s.labor = round2(s.labor);
  s.material = round2(s.material);
  s.equipment = round2(s.equipment);
  return { ...s, subtotal: round2(s.labor + s.material + s.equipment) };
}

export type EstimateTotals = {
  subtotal: number;
  overhead: number;
  costTotal: number;
  markupAmount: number;
  total: number;
  profit: number;
  marginPercent: number;
};

export function estimateTotals(
  lines: LineLike[],
  overheadPercent: number,
  markupPercent: number,
): EstimateTotals {
  const { subtotal } = summarize(lines);
  const overhead = round2(subtotal * (overheadPercent / 100));
  const costTotal = round2(subtotal + overhead);
  const markupAmount = round2(costTotal * (markupPercent / 100));
  const total = round2(costTotal + markupAmount);
  const profit = markupAmount;
  const marginPercent = total > 0 ? round2((profit / total) * 100) : 0;
  return { subtotal, overhead, costTotal, markupAmount, total, profit, marginPercent };
}

/**
 * Customer-facing breakdown: the total split into materials / labor /
 * equipment in the same proportions as the underlying costs. The customer
 * never sees overhead, markup, profit, or margin figures.
 */
export function customerBreakdown(lines: LineLike[], total: number): Split {
  const s = summarize(lines);
  if (s.subtotal <= 0 || total <= 0) return { labor: 0, material: 0, equipment: 0 };
  const out: Split = {
    labor: round2((s.labor / s.subtotal) * total),
    material: round2((s.material / s.subtotal) * total),
    equipment: round2((s.equipment / s.subtotal) * total),
  };
  // Absorb rounding remainder into the largest bucket so the parts sum to the total.
  const drift = round2(total - (out.labor + out.material + out.equipment));
  if (drift !== 0) {
    const largest = (Object.keys(out) as (keyof Split)[]).reduce((a, b) =>
      out[a] >= out[b] ? a : b,
    );
    out[largest] = round2(out[largest] + drift);
  }
  return out;
}

/** Human-confirm gate: an estimate may be sent/approved only with at least one line and zero VERIFY lines. */
export const unconfirmedCount = (lines: LineLike[]) =>
  lines.filter((l) => l.status !== "confirmed").length;
export const canMarkSent = (lines: LineLike[]) => lines.length > 0 && unconfirmedCount(lines) === 0;

export type LibraryItemLike = Split & {
  id?: string;
  sampleKey?: string | null;
  description: string;
  unit: string;
};

const findItem = (items: LibraryItemLike[], key: string) => items.find((i) => i.sampleKey === key);

/**
 * Draft the starting lines for a concrete measure, priced from the library.
 * Every line comes back unpriced-or-priced but always starts life VERIFY in
 * the editor (status is assigned by the caller / DB default).
 * Quantities: concrete = order yards; tear-out and reinforcement = sq ft;
 * gravel = tons; forms = perimeter LF; labor = crew days (2 with tear-out,
 * else 1 — an editable default, matching the guide's two worked examples).
 */
export function draftConcreteLines(m: ConcreteMeasure, items: LibraryItemLike[]): LineDraft[] {
  const lines: LineDraft[] = [];
  const sqft = m.lengthFt * m.widthFt;
  const perimeter = 2 * (m.lengthFt + m.widthFt);
  const push = (key: string, fallback: Omit<LineDraft, "quantity">, quantity: number) => {
    const item = findItem(items, key);
    if (item) {
      lines.push({
        description: item.description,
        unit: item.unit,
        quantity,
        labor: item.labor,
        material: item.material,
        equipment: item.equipment,
        itemKey: key,
      });
    } else {
      lines.push({ ...fallback, quantity });
    }
  };

  if (m.demo) {
    push(
      "tearout_sf",
      {
        description: "Tear-out & haul-off of existing concrete",
        unit: "SF",
        labor: 0,
        material: 0,
        equipment: 0,
        itemKey: "tearout_sf",
      },
      sqft,
    );
  }
  const yards = concreteYards(m.lengthFt, m.widthFt, m.thicknessIn);
  push(
    "concrete_cy",
    {
      description: "Concrete, delivered",
      unit: "CY",
      labor: 0,
      material: 0,
      equipment: 0,
      itemKey: "concrete_cy",
    },
    yards.order,
  );
  if (m.basePrep) {
    push(
      "gravel_ton",
      {
        description: "Gravel base, delivered",
        unit: "TON",
        labor: 0,
        material: 0,
        equipment: 0,
        itemKey: "gravel_ton",
      },
      gravelTons(m.lengthFt, m.widthFt),
    );
  }
  if (m.reinforcement === "mesh") {
    push(
      "wire_mesh_sf",
      {
        description: "Wire mesh reinforcement",
        unit: "SF",
        labor: 0,
        material: 0,
        equipment: 0,
        itemKey: "wire_mesh_sf",
      },
      sqft,
    );
  }
  if (m.reinforcement === "rebar") {
    push(
      "rebar_sf",
      {
        description: "Rebar grid reinforcement",
        unit: "SF",
        labor: 0,
        material: 0,
        equipment: 0,
        itemKey: "rebar_sf",
      },
      sqft,
    );
  }
  push(
    "forms_lf",
    {
      description: "Forms & stakes",
      unit: "LF",
      labor: 0,
      material: 0,
      equipment: 0,
      itemKey: "forms_lf",
    },
    perimeter,
  );
  push(
    "crew_day",
    {
      description: "Labor — crew day",
      unit: "DAY",
      labor: 0,
      material: 0,
      equipment: 0,
      itemKey: "crew_day",
    },
    m.demo ? 2 : 1,
  );
  push(
    "curing_ls",
    {
      description: "Curing compound, expansion joints, misc.",
      unit: "LS",
      labor: 0,
      material: 0,
      equipment: 0,
      itemKey: "curing_ls",
    },
    1,
  );
  return lines;
}

export const FINISH_LABEL: Record<ConcreteMeasure["finish"], string> = {
  broom: "Broom finish",
  smooth: "Smooth trowel finish",
  stamped: "Stamped finish",
  exposed: "Exposed aggregate finish",
};

export function describeMeasure(m: ConcreteMeasure): string {
  const yards = concreteYards(m.lengthFt, m.widthFt, m.thicknessIn);
  const parts = [
    `${m.lengthFt} × ${m.widthFt} ft, ${m.thicknessIn} in thick (${round2(yards.withWaste)} yd³ with 10% waste; order ${yards.order} yd³)`,
    FINISH_LABEL[m.finish],
  ];
  if (m.demo) parts.push("includes tear-out & haul-off of existing concrete");
  if (m.basePrep) parts.push("gravel base prep");
  if (m.reinforcement === "mesh") parts.push("wire mesh reinforcement");
  if (m.reinforcement === "rebar") parts.push("rebar reinforcement");
  return parts.join(" · ");
}
