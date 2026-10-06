import { createContext, useContext } from "react";
import { TRADES, DOCS, type DocId, type TradeId } from "@/lib/template-packs";

type FormValues = Record<string, string>;
const FillCtx = createContext<{ values: FormValues; set: (k: string, v: string) => void } | null>(null);

const Line = ({ label, tall }: { label: string; tall?: boolean }) => {
  const fill = useContext(FillCtx);
  const v = fill?.values[label] ?? "";
  return (
    <div className="mt-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      {fill ? (tall
        ? <textarea aria-label={label} value={v} onChange={(e) => fill.set(label, e.target.value)} className="h-24 w-full resize-none border-0 border-b border-foreground/60 bg-transparent p-1 text-sm focus:outline-none focus:ring-0" />
        : <input aria-label={label} value={v} onChange={(e) => fill.set(label, e.target.value)} className="h-8 w-full border-0 border-b border-foreground/60 bg-transparent px-1 text-sm focus:outline-none" />)
        : <div className={`border-b border-foreground/60 ${tall ? "h-24" : "h-8"}`} />}
    </div>
  );
};

function Table({ cols, rows = 10, first }: { cols: string[]; rows?: number; first?: string[] }) {
  const fill = useContext(FillCtx);
  return (
    <table className="mt-5 w-full border-collapse text-sm">
      <thead>
        <tr>{cols.map((c) => <th key={c} className="border border-foreground/50 px-2 py-1.5 text-left text-xs font-semibold uppercase">{c}</th>)}</tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r}>{cols.map((c, ci) => (
            <td key={c} className="h-8 border border-foreground/50 px-2 text-xs text-muted-foreground">{fill ? (() => {
              const k = `${cols.join("|")}#${r}#${ci}`;
              return <input aria-label={`${c} row ${r + 1}`} value={fill.values[k] ?? (ci === 0 ? first?.[r] ?? "" : "")} onChange={(e) => fill.set(k, e.target.value)} className="w-full bg-transparent text-xs text-foreground focus:outline-none" />;
            })() : ci === 0 ? first?.[r] ?? "" : ""}</td>
          ))}</tr>
        ))}
      </tbody>
    </table>
  );
}

const Signatures = () => (
  <div className="mt-6 grid gap-x-6 sm:grid-cols-2 print:grid-cols-2">
    <Line label="Subcontractor signature / date" />
    <Line label="GC / superintendent signature / date" />
  </div>
);

export function TemplateDoc({ trade, doc, values, onChange }: { trade: TradeId; doc: DocId; values?: FormValues; onChange?: (v: FormValues) => void }) {
  const ctx = values && onChange ? { values, set: (k: string, v: string) => onChange({ ...values, [k]: v }) } : null;
  return <FillCtx.Provider value={ctx}><Doc trade={trade} doc={doc} /></FillCtx.Provider>;
}

function Doc({ trade, doc }: { trade: TradeId; doc: DocId }) {
  const t = TRADES.find((x) => x.id === trade)!;
  const name = DOCS.find((d) => d.id === doc)!.name;
  const header = (
    <div className="flex items-baseline justify-between border-b-2 border-foreground pb-2">
      <h2 className="text-2xl font-extrabold text-heading">{name}</h2>
      <span className="font-mono text-xs uppercase">{t.name} · No. ______</span>
    </div>
  );
  const jobBlock = (
    <div className="grid gap-x-6 sm:grid-cols-2 print:grid-cols-2">
      <Line label="Subcontractor" /><Line label="Date" />
      <Line label="Project / job name" /><Line label="General contractor" />
    </div>
  );

  return (
    <section className="break-after-page rounded-lg border bg-card p-6 print:border-0 print:p-0">
      {header}
      {doc === "change-order" && (<>
        {jobBlock}
        <Line label="Location on site" />
        <Line label="Description of changed condition" tall />
        <Line label="Scope of extra work" tall />
        <Table cols={["Item", "Qty", "Unit", "Unit price", "Total"]} rows={6} first={t.items} />
        <div className="grid gap-x-6 sm:grid-cols-3 print:grid-cols-3">
          <Line label="Lump-sum price ($)" /><Line label="Schedule impact (days)" /><Line label="Photos attached (#)" />
        </div>
        <div className="mt-4 text-xs">{t.checks.map((c) => <div key={c} className="mt-1">☐ {c}</div>)}</div>
        <Signatures />
      </>)}
      {doc === "change-order-request" && (<>
        {jobBlock}
        <Line label="Reason for request (RFI / drawing / field condition)" tall />
        <Line label="Proposed change" tall />
        <Table cols={["Cost item", "Amount"]} rows={5} first={["Labor", "Material", "Equipment", "Overhead & profit", "Total requested"]} />
        <Line label="Response needed by (date)" />
        <Signatures />
      </>)}
      {doc === "change-order-log" && (<>
        <div className="grid gap-x-6 sm:grid-cols-2 print:grid-cols-2"><Line label="Project / job name" /><Line label="General contractor" /></div>
        <Table cols={["CO #", "Date", "Description", "Amount", "Status", "Signed by", "Billed (month)"]} rows={16} />
      </>)}
      {doc === "work-order" && (<>
        {jobBlock}
        <div className="grid gap-x-6 sm:grid-cols-2 print:grid-cols-2"><Line label="Assigned to (foreman / crew)" /><Line label="Start / due date" /></div>
        <Line label="Work to be performed" tall />
        <Table cols={["Material / item", "Qty", "Notes"]} rows={6} first={t.items} />
        <Line label="Completion notes" tall />
        <Signatures />
      </>)}
      {doc === "schedule" && (<>
        <div className="grid gap-x-6 sm:grid-cols-2 print:grid-cols-2"><Line label="Project / job name" /><Line label="Start date" /></div>
        <Table cols={["Task", "Crew", "Start", "Finish", "Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6"]} rows={14} first={t.items.map((i) => i.replace(/ \(.*\)$/, ""))} />
      </>)}
      {doc === "budget" && (<>
        {jobBlock}
        <Table cols={["Cost code / item", "Estimate", "Approved COs", "Revised budget", "Spent to date", "Remaining"]} rows={12} first={t.items} />
        <div className="grid gap-x-6 sm:grid-cols-3 print:grid-cols-3">
          <Line label="Original contract ($)" /><Line label="Approved change orders ($)" /><Line label="Revised contract ($)" />
        </div>
      </>)}
      {doc === "workflow" && (
        <ol className="mt-5 space-y-3 text-sm">
          {[
            "Stop: spot the changed condition before doing extra work.",
            "Photograph the condition (wide shot + close-up + something for scale).",
            `Note what's different from the drawings — ${t.checks[0]!.toLowerCase()}`,
            "Fill out the change order request with labor, material and equipment.",
            "Price it as a lump sum and note any schedule impact.",
            "Get the GC superintendent's signature BEFORE the work starts.",
            "Log it in the change order log with date, amount and status.",
            "Attach signed copies to the monthly pay application.",
            "Follow up within 24 hours on anything still unsigned.",
          ].map((s, i) => (
            <li key={s} className="flex gap-3"><span className="font-mono text-xs">☐ {String(i + 1).padStart(2, "0")}</span><span>{s}</span></li>
          ))}
        </ol>
      )}
      <p className="mt-6 text-[10px] text-muted-foreground">FieldCO · approvefield.app</p>
    </section>
  );
}
