import type { LibraryItemLike } from "@/lib/estimate-engine";

/**
 * Starter library for Photo Estimate. Prices are EXAMPLE prices taken from
 * Barbie's "How To Quote Concrete Jobs" guide (2026-11-11) so a brand-new
 * user can run the flow end to end. Every row is seeded with is_sample=true
 * and shown in the product with a "SAMPLE — placeholder price" label, the
 * same pattern The Command Suite's Estimate Builder (A1) uses. The user is
 * expected to replace them with their own prices; saving an edited price
 * clears the sample flag (see estimates.ts).
 */
export type SampleItem = LibraryItemLike & { sampleKey: string };

export const SAMPLE_ITEMS: SampleItem[] = [
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
    description: "Tear-out & haul-off of existing concrete",
    unit: "SF",
    labor: 2.45,
    material: 0,
    equipment: 1.05,
  },
  {
    sampleKey: "wire_mesh_sf",
    description: "Wire mesh reinforcement",
    unit: "SF",
    labor: 0,
    material: 0.23,
    equipment: 0,
  },
  {
    sampleKey: "rebar_sf",
    description: "Rebar grid reinforcement",
    unit: "SF",
    labor: 0,
    material: 0.55,
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
    description: "Labor — crew day",
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

export const SAMPLE_LABEL = "SAMPLE — placeholder price";
