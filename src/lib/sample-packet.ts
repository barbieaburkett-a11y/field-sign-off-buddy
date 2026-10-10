import fieldPhoto from "@/assets/field-electrical.jpg";
import type { PacketData } from "@/components/Packet";

// Fully fictional sample — no customer data. Signature is a drawn-style SVG, matching the real finger-drawn signature pad.
const sig = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="96"><path d="M14 70 C40 20 52 20 58 62 S88 30 100 58 S130 72 140 40 S170 20 176 64 C190 50 205 44 220 60 S260 70 300 36" fill="none" stroke="#1a241f" stroke-width="3" stroke-linecap="round"/></svg>')}`;

export const SAMPLE_PACKET: PacketData = {
  number: 1,
  version: 1,
  title: "Two additional wall receptacles",
  description: "GC requested two added receptacles on the east wall of Room 214 after rough-in. Provide conduit, wiring, boxes, and devices outside the original scope. Includes patching and plate covers.",
  amount: 1850,
  schedule_impact_days: 0,
  status: "approved",
  foreman_name: "Sam Rivera",
  signer_name: "Dana Whitfield (sample)",
  signer_title: "Superintendent, Example Builders GC",
  signature: sig,
  signed_method: "remote",
  signed_at: "2026-09-14T18:42:00-04:00",
  sent_at: "2026-09-14T14:05:00-04:00",
  created_at: "2026-09-14T13:58:00-04:00",
  reject_reason: null,
  jobs: { name: "Riverside Medical — Tenant Fit-Out (sample)", gc_name: "Example Builders GC", address: "100 Sample Way, Anytown" },
  photoUrls: [fieldPhoto],
  companyName: "Example Electric Co. (fictional)",
  companyLogoUrl: null,
};
