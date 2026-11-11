import { dateOnly, money } from "@/lib/format";
import { customerBreakdown, DRAFT_STAMP, type LineLike } from "@/lib/estimate-engine";
import { estNumber } from "@/lib/estimates";

export type EstimatePacketData = {
  number: number;
  title: string;
  siteNotes: string;
  scopeSummary: string;
  clientName: string | null;
  createdAt: string;
  status: string;
  photoUrls: string[];
  lines: (LineLike & { description: string; unit: string })[];
  total: number;
  unconfirmed: number;
  companyName?: string | null;
  companyLogoUrl?: string | null;
};

/**
 * Customer view of a Photo Estimate — the print / Save-PDF page.
 * Shows photos, scope, line items (description + quantity only), a
 * materials / labor / equipment share of the total, and the total.
 * It receives only the final total and cost proportions, never the
 * internal cost build-up, so no internal figure can appear here.
 */
export function EstimatePacket({ est }: { est: EstimatePacketData }) {
  const breakdown = customerBreakdown(est.lines, est.total);
  const rows = [
    { label: "Materials", value: breakdown.material },
    { label: "Labor", value: breakdown.labor },
    { label: "Equipment", value: breakdown.equipment },
  ].filter((r) => r.value > 0);
  return (
    <article className="rounded-xl border bg-card p-6 text-card-foreground print:border-0 print:p-0">
      <header className="flex items-start justify-between border-b-4 border-primary pb-4">
        <div className="flex items-start gap-3">
          {est.companyLogoUrl && (
            <img
              src={est.companyLogoUrl}
              alt={`${est.companyName || "Company"} logo`}
              className="h-11 w-11 object-contain"
            />
          )}
          <div>
            {est.companyName && <div className="mb-1 text-sm font-bold">{est.companyName}</div>}
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Photo Estimate
            </div>
            <h1 className="mt-1 text-2xl font-extrabold">{estNumber(est.number)}</h1>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase text-muted-foreground">Estimate total</div>
          <div className="font-display text-3xl font-extrabold">{money(est.total)}</div>
        </div>
      </header>

      {est.unconfirmed > 0 && (
        <p className="mt-4 rounded-md border border-dashed px-3 py-2 text-center text-sm font-bold uppercase tracking-wide">
          {DRAFT_STAMP}
        </p>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div>
          <dt className="text-muted-foreground">Prepared for</dt>
          <dd className="font-medium">{est.clientName || "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Date</dt>
          <dd>{dateOnly(est.createdAt)}</dd>
        </div>
      </dl>

      <section className="mt-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Scope of work
        </h2>
        <p className="mt-1 font-semibold">{est.title}</p>
        {est.scopeSummary && <p className="mt-1 text-sm">{est.scopeSummary}</p>}
        {est.siteNotes && <p className="mt-1 whitespace-pre-wrap text-sm">{est.siteNotes}</p>}
      </section>

      {est.photoUrls.length > 0 && (
        <section className="mt-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Photos ({est.photoUrls.length})
          </h2>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {est.photoUrls.map((u, i) => (
              <img
                key={i}
                src={u}
                alt={`Site photo ${i + 1}`}
                className="aspect-[4/3] w-full rounded-md border object-cover break-inside-avoid"
              />
            ))}
          </div>
        </section>
      )}

      <section className="mt-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          What's included
        </h2>
        <table className="mt-2 w-full text-sm">
          <tbody>
            {est.lines.map((l, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-2 pr-3">{l.description}</td>
                <td className="py-2 text-right whitespace-nowrap tabular-nums">
                  {l.quantity} {l.unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-5 break-inside-avoid">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          How the total breaks down
        </h2>
        <dl className="mt-2 space-y-1 text-sm">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between">
              <dt>{r.label}</dt>
              <dd className="tabular-nums">{money(r.value)}</dd>
            </div>
          ))}
          <div className="flex justify-between border-t pt-2 text-base font-extrabold">
            <dt>Total</dt>
            <dd className="tabular-nums">{money(est.total)}</dd>
          </div>
        </dl>
      </section>

      <footer className="mt-6 text-[10px] text-muted-foreground">
        This estimate is based on the measurements and site conditions recorded above on the date
        shown. If hidden conditions differ from what was visible and measured on site, the price may
        change — any change will be agreed in writing before the extra work happens.
      </footer>
    </article>
  );
}
