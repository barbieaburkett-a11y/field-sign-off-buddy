// Browser-safe catalog for the paid trade template packs.
export type TradeId = "electrical" | "plumbing_hvac" | "concrete_framing" | "finishes";
export type PackId = TradeId | "bundle";

export const TRADES: { id: TradeId; name: string; short: string; items: string[]; checks: string[] }[] = [
  {
    id: "electrical", name: "Electrical", short: "Electrical",
    items: ["Conduit / raceway (LF)", "Wire & cable (LF)", "Devices & boxes (EA)", "Panel / breaker changes", "Fixtures (EA)", "Labor (hrs)"],
    checks: ["Circuit / panel affected", "Inspection required?", "Load calc changed?", "Low-voltage / fire alarm affected?"],
  },
  {
    id: "plumbing_hvac", name: "Plumbing & HVAC", short: "Plumbing & HVAC",
    items: ["Pipe & fittings (LF)", "Ductwork (LF)", "Fixtures / equipment (EA)", "Valves & dampers (EA)", "Insulation", "Labor (hrs)"],
    checks: ["System shut-down needed?", "Pressure test / balance required?", "Permit revision?", "Equipment submittal changed?"],
  },
  {
    id: "concrete_framing", name: "Concrete & Framing", short: "Concrete & Framing",
    items: ["Concrete (CY)", "Rebar / mesh (LBS)", "Formwork (SF)", "Lumber / studs (EA)", "Hardware & anchors", "Labor (hrs)"],
    checks: ["Engineer / RFI reference", "Special inspection?", "Cure / pour schedule impact", "Shoring or re-work required?"],
  },
  {
    id: "finishes", name: "Drywall, Paint & Finishes", short: "Drywall & Finishes",
    items: ["Drywall (SF)", "Framing / backing (LF)", "Tape & finish level", "Paint (SF / coats)", "Patch & repair areas", "Labor (hrs)"],
    checks: ["Damage caused by other trade?", "Finish level change?", "Color / spec change?", "Re-work after punch?"],
  },
];

// Document set in every pack, picked from the most-searched construction template terms.
export const DOCS = [
  { id: "change-order", name: "Change order form" },
  { id: "change-order-request", name: "Change order request" },
  { id: "change-order-log", name: "Change order log" },
  { id: "work-order", name: "Work order" },
  { id: "schedule", name: "Construction schedule" },
  { id: "budget", name: "Job budget & estimate" },
  { id: "workflow", name: "Change order workflow checklist" },
] as const;
export type DocId = (typeof DOCS)[number]["id"];

export const PACK_PRICE_ID: Record<PackId, string> = {
  electrical: "tpl_electrical_once",
  plumbing_hvac: "tpl_plumbing_hvac_once",
  concrete_framing: "tpl_concrete_framing_once",
  finishes: "tpl_finishes_once",
  bundle: "tpl_bundle_once",
};
export const PACK_PRICE_LABEL: Record<PackId, string> = {
  electrical: "$9.99", plumbing_hvac: "$9.99", concrete_framing: "$9.99", finishes: "$9.99", bundle: "$39",
};

export function tradesForPacks(packs: string[]): TradeId[] {
  if (packs.includes("bundle")) return TRADES.map((t) => t.id);
  return TRADES.map((t) => t.id).filter((id) => packs.includes(id));
}
