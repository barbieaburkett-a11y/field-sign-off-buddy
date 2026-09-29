import { coNumber, dateTime, money, STATUS_LABEL, type Status } from "@/lib/format";

export type PacketData = {
  number: number;
  title: string;
  description: string;
  amount: number;
  status: string;
  foreman_name: string | null;
  signer_name: string | null;
  signer_title: string | null;
  signature: string | null;
  signed_method?: string | null;
  signed_at: string | null;
  sent_at: string | null;
  created_at: string;
  reject_reason: string | null;
  jobs: { name: string; gc_name: string | null; address?: string | null } | null;
  photoUrls: string[];
};

export function Packet({ co }: { co: PacketData }) {
  return (
    <article className="rounded-xl border bg-card p-6 text-card-foreground print:border-0 print:p-0">
      <header className="flex items-start justify-between border-b-4 border-primary pb-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Field Change Directive</div>
          <h1 className="mt-1 text-2xl font-extrabold">{coNumber(co.number)}</h1>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase text-muted-foreground">Lump sum</div>
          <div className="font-display text-3xl font-extrabold">{money(co.amount)}</div>
        </div>
      </header>
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div><dt className="text-muted-foreground">Job</dt><dd className="font-medium">{co.jobs?.name}</dd></div>
        <div><dt className="text-muted-foreground">General contractor</dt><dd className="font-medium">{co.jobs?.gc_name || "—"}</dd></div>
        <div><dt className="text-muted-foreground">Created</dt><dd>{dateTime(co.created_at)}</dd></div>
        <div><dt className="text-muted-foreground">Status</dt><dd className="font-medium">{STATUS_LABEL[co.status as Status]}</dd></div>
        <div><dt className="text-muted-foreground">Foreman</dt><dd>{co.foreman_name || "—"}</dd></div>
        {co.sent_at && <div><dt className="text-muted-foreground">Sent for approval</dt><dd>{dateTime(co.sent_at)}</dd></div>}
      </dl>
      <section className="mt-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Scope</h2>
        <p className="mt-1 font-semibold">{co.title}</p>
        <p className="mt-1 whitespace-pre-wrap text-sm">{co.description || "—"}</p>
      </section>
      {co.photoUrls.length > 0 && (
        <section className="mt-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Photos ({co.photoUrls.length})</h2>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {co.photoUrls.map((u, i) => (
              <a key={i} href={u} target="_blank" rel="noreferrer">
                <img src={u} alt={`Condition photo ${i + 1}`} className="aspect-[4/3] w-full rounded-md border object-cover" />
              </a>
            ))}
          </div>
        </section>
      )}
      {(co.status === "approved" || co.status === "rejected") && (
        <section className="mt-6 border-t pt-4 break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            {co.status === "approved" ? "Authorized by" : "Rejected by"}
          </h2>
          {co.signature && <img src={co.signature} alt="Signature" className="mt-2 h-24 border-b" />}
          <p className="mt-1 font-medium">{co.signer_name}{co.signer_title ? `, ${co.signer_title}` : ""}</p>
          <p className="text-xs text-muted-foreground">
            {dateTime(co.signed_at)}
            {co.signed_method ? ` · ${co.signed_method === "remote" ? "Signed via remote link" : "Signed on site"}` : ""}
          </p>
          {co.reject_reason && <p className="mt-2 text-sm">Reason: {co.reject_reason}</p>}
        </section>
      )}
      <footer className="mt-6 text-[10px] text-muted-foreground">
        By signing, the authorized representative directs the subcontractor to proceed with the work described above for the stated lump-sum amount.
      </footer>
    </article>
  );
}
