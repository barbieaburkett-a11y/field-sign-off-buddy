import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  canMarkSent,
  concreteYards,
  customerBreakdown,
  describeMeasure,
  draftConcreteLines,
  estimateTotals,
  gravelTons,
  round2,
  summarize,
  unconfirmedCount,
  type ConcreteMeasure,
  type LibraryItemLike,
  type LineLike,
} from "@/lib/estimate-engine";
import { EstimatePacket } from "@/components/EstimatePacket";

/**
 * Fixtures are the worked examples in Barbie's "How To Quote Concrete Jobs"
 * guide (2026-11-11), using the guide's exact example prices:
 * concrete $165/yd3 delivered, gravel $30/ton, tear-out $3.50/sq ft,
 * wire mesh $90 per 400 sq ft ($0.225), rebar $350 per 640 sq ft ($0.546875),
 * forms $1.50/LF in example A, crew day $1,200, curing/misc $150 lump sum.
 */
const guideItems = (
  overrides: Partial<Record<string, Partial<LibraryItemLike>>> = {},
): LibraryItemLike[] => {
  const base: LibraryItemLike[] = [
    {
      sampleKey: "concrete_cy",
      description: "Concrete, delivered",
      unit: "CY",
      labor: 0,
      material: 165,
      equipment: 0,
    },
    {
      sampleKey: "gravel_ton",
      description: "Gravel base, delivered",
      unit: "TON",
      labor: 0,
      material: 30,
      equipment: 0,
    },
    {
      sampleKey: "tearout_sf",
      description: "Tear-out & haul-off",
      unit: "SF",
      labor: 2.45,
      material: 0,
      equipment: 1.05,
    },
    {
      sampleKey: "wire_mesh_sf",
      description: "Wire mesh",
      unit: "SF",
      labor: 0,
      material: 0.225,
      equipment: 0,
    },
    {
      sampleKey: "rebar_sf",
      description: "Rebar grid",
      unit: "SF",
      labor: 0,
      material: 0.546875,
      equipment: 0,
    },
    {
      sampleKey: "forms_lf",
      description: "Forms & stakes",
      unit: "LF",
      labor: 0,
      material: 1.5,
      equipment: 0,
    },
    {
      sampleKey: "crew_day",
      description: "Labor",
      unit: "DAY",
      labor: 1200,
      material: 0,
      equipment: 0,
    },
    {
      sampleKey: "curing_ls",
      description: "Curing compound, expansion joints, misc.",
      unit: "LS",
      labor: 0,
      material: 150,
      equipment: 0,
    },
  ];
  return base.map((i) => ({ ...i, ...(overrides[i.sampleKey!] ?? {}) }));
};

describe("concrete math — the guide's method", () => {
  test("Worked example A: 20x20 patio, 4 in", () => {
    const y = concreteYards(20, 20, 4);
    expect(round2(y.raw)).toBe(4.94); // guide: 4.94 yd3
    expect(round2(y.withWaste)).toBe(5.43); // guide: +10% = 5.43
    expect(y.order).toBe(5.5); // guide: order 5 1/2 yd3
  });

  test("Worked example B: 16x40 driveway, 5 in", () => {
    const y = concreteYards(16, 40, 5);
    expect(round2(y.raw)).toBe(9.88); // guide: 9.88 yd3
    expect(round2(y.withWaste)).toBe(10.86); // guide: +10% = 10.86
    expect(y.order).toBe(11); // guide: order 11 yd3
  });

  test("Spec acceptance: 10x10 ft, 4 in patch matches the hand calculation", () => {
    const y = concreteYards(10, 10, 4);
    // Guide table: 4 in = 1.23 yd3 per 100 sq ft, 1.36 yd3 with 10% waste.
    expect(round2(y.raw)).toBe(1.23);
    expect(round2(y.withWaste)).toBe(1.36);
    expect(y.order).toBe(1.5);
  });

  test("Guide per-100-sq-ft table: 5 in and 6 in", () => {
    expect(round2(concreteYards(10, 10, 5).raw)).toBe(1.54);
    expect(round2(concreteYards(10, 10, 5).withWaste)).toBe(1.7);
    expect(round2(concreteYards(10, 10, 6).raw)).toBe(1.85);
    expect(round2(concreteYards(10, 10, 6).withWaste)).toBe(2.04);
  });

  test("Gravel: example A's 400 sq ft at 4 in base = 7 tons", () => {
    expect(gravelTons(20, 20)).toBe(7);
  });
});

describe("worked example A — full quote from the generator", () => {
  const measure: ConcreteMeasure = {
    type: "concrete",
    lengthFt: 20,
    widthFt: 20,
    thicknessIn: 4,
    demo: false,
    basePrep: true,
    finish: "broom",
    reinforcement: "mesh",
  };
  const lines = draftConcreteLines(measure, guideItems());

  test("drafts the guide's lines and quantities", () => {
    const byKey = Object.fromEntries(lines.map((l) => [l.itemKey, l]));
    expect(byKey.concrete_cy.quantity).toBe(5.5);
    expect(byKey.gravel_ton.quantity).toBe(7);
    expect(byKey.wire_mesh_sf.quantity).toBe(400);
    expect(byKey.forms_lf.quantity).toBe(80);
    expect(byKey.crew_day.quantity).toBe(1);
    expect(byKey.curing_ls.quantity).toBe(1);
    expect(lines.some((l) => l.itemKey === "tearout_sf")).toBe(false);
  });

  test("totals reproduce the guide: subtotal 2677.50, +10% overhead, +20% markup = 3534.30", () => {
    const t = estimateTotals(lines, 10, 20);
    expect(t.subtotal).toBe(2677.5);
    expect(t.overhead).toBe(267.75);
    expect(t.markupAmount).toBe(589.05);
    expect(t.total).toBe(3534.3);
    expect(round2(t.total / 400)).toBe(8.84); // guide sanity check: $8.84 per sq ft
    expect(t.marginPercent).toBe(16.67); // guide prints this as 16.7% (1 decimal): 20% markup = 16.7% margin
  });

  test("cost split matches the guide's line costs", () => {
    const s = summarize(lines);
    // material: 907.50 concrete + 210 gravel + 90 mesh + 120 forms + 150 curing
    expect(s.material).toBe(1477.5);
    expect(s.labor).toBe(1200);
    expect(s.equipment).toBe(0);
    expect(s.subtotal).toBe(2677.5);
  });
});

describe("worked example B — driveway replacement totals", () => {
  // The guide's lines, exactly as printed (gravel was a 3-ton touch-up judgment
  // call, so B is reproduced from its printed lines rather than the generator).
  const lines: LineLike[] = [
    { quantity: 640, labor: 2.45, material: 0, equipment: 1.05, status: "confirmed" }, // tear-out $3.50/sf
    { quantity: 11, labor: 0, material: 165, equipment: 0, status: "confirmed" }, // concrete
    { quantity: 3, labor: 0, material: 30, equipment: 0, status: "confirmed" }, // gravel touch-up
    { quantity: 640, labor: 0, material: 0.546875, equipment: 0, status: "confirmed" }, // rebar $350
    { quantity: 112, labor: 0, material: 150 / 112, equipment: 0, status: "confirmed" }, // forms $150
    { quantity: 2, labor: 1200, material: 0, equipment: 0, status: "confirmed" }, // labor, two days
  ];

  test("generator still gets B's concrete and tear-out quantities right", () => {
    const measure: ConcreteMeasure = {
      type: "concrete",
      lengthFt: 16,
      widthFt: 40,
      thicknessIn: 5,
      demo: true,
      basePrep: true,
      finish: "broom",
      reinforcement: "rebar",
    };
    const drafted = draftConcreteLines(measure, guideItems());
    const byKey = Object.fromEntries(drafted.map((l) => [l.itemKey, l]));
    expect(byKey.concrete_cy.quantity).toBe(11);
    expect(byKey.tearout_sf.quantity).toBe(640);
    expect(byKey.rebar_sf.quantity).toBe(640);
    expect(byKey.forms_lf.quantity).toBe(112);
    expect(byKey.crew_day.quantity).toBe(2);
  });

  test("totals reproduce the guide: subtotal 7045, +10% overhead, +15% markup = 8911.93", () => {
    const t = estimateTotals(lines, 10, 15);
    expect(t.subtotal).toBe(7045);
    expect(t.overhead).toBe(704.5);
    expect(t.markupAmount).toBe(1162.43);
    expect(t.total).toBe(8911.93);
    expect(round2(t.total / 640)).toBe(13.92);
  });
});

describe("human-confirm gate", () => {
  const draft: LineLike[] = [
    { quantity: 1, labor: 100, material: 0, equipment: 0, status: "verify" },
    { quantity: 1, labor: 0, material: 50, equipment: 0, status: "confirmed" },
  ];
  test("blocks sending while any line is VERIFY", () => {
    expect(unconfirmedCount(draft)).toBe(1);
    expect(canMarkSent(draft)).toBe(false);
  });
  test("blocks sending with no lines at all", () => {
    expect(canMarkSent([])).toBe(false);
  });
  test("allows sending once every line is confirmed", () => {
    const done = draft.map((l) => ({ ...l, status: "confirmed" }));
    expect(unconfirmedCount(done)).toBe(0);
    expect(canMarkSent(done)).toBe(true);
  });
});

describe("customer view safety", () => {
  const measure: ConcreteMeasure = {
    type: "concrete",
    lengthFt: 20,
    widthFt: 20,
    thicknessIn: 4,
    demo: false,
    basePrep: true,
    finish: "broom",
    reinforcement: "mesh",
  };
  const lines = draftConcreteLines(measure, guideItems()).map((l, i) => ({
    ...l,
    id: String(i),
    status: "verify" as const,
  }));
  const totals = estimateTotals(lines, 10, 20);

  test("breakdown parts sum exactly to the total", () => {
    const b = customerBreakdown(lines, totals.total);
    expect(round2(b.labor + b.material + b.equipment)).toBe(totals.total);
    expect(b.labor).toBeGreaterThan(0);
    expect(b.material).toBeGreaterThan(0);
  });

  const render = (unconfirmed: number) =>
    renderToStaticMarkup(
      createElement(EstimatePacket, {
        est: {
          number: 1,
          title: "Concrete patio",
          siteNotes: "Good access from the driveway.",
          scopeSummary: describeMeasure(measure),
          clientName: "Test Customer",
          createdAt: "2026-11-11T15:00:00Z",
          status: "draft",
          photoUrls: ["https://example.com/photo1.jpg"],
          lines,
          total: totals.total,
          unconfirmed,
          companyName: "Test Co",
        },
      }),
    );

  test("packet shows scope, photos and total — and no internal money words", () => {
    const html = render(0);
    expect(html).toContain("Concrete patio");
    expect(html).toContain("photo1.jpg");
    expect(html).toContain("$3,534.30");
    const lower = html.toLowerCase();
    for (const banned of ["profit", "margin", "markup", "overhead"]) {
      expect(lower).not.toContain(banned);
    }
  });

  test("packet carries the DRAFT stamp while lines are unconfirmed, and drops it after", () => {
    expect(render(2)).toContain("DRAFT — contains lines that have not been confirmed");
    expect(render(0)).not.toContain("DRAFT — contains lines");
  });
});

describe("the full walk — draft to sendable, engine level", () => {
  test("create from measure → VERIFY lines → gate blocks → confirm → totals hold", () => {
    const measure: ConcreteMeasure = {
      type: "concrete",
      lengthFt: 10,
      widthFt: 10,
      thicknessIn: 4,
      demo: false,
      basePrep: false,
      finish: "broom",
      reinforcement: "none",
    };
    const drafted = draftConcreteLines(measure, guideItems()).map((l) => ({
      ...l,
      status: "verify",
    }));
    expect(drafted.length).toBeGreaterThan(0);
    expect(canMarkSent(drafted)).toBe(false);
    const confirmed = drafted.map((l) => ({ ...l, status: "confirmed" }));
    expect(canMarkSent(confirmed)).toBe(true);
    const t = estimateTotals(confirmed, 10, 20);
    // 10x10 patch: concrete 1.5 CY x $165 = $247.50, forms 40 LF x $1.50 = $60,
    // labor 1 day $1,200, curing $150 -> subtotal $1,657.50
    expect(t.subtotal).toBe(1657.5);
    expect(t.total).toBe(round2((1657.5 + 165.75) * 1.2));
  });
});
