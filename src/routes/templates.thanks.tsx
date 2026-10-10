import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getTokenForTransaction } from "@/lib/templates.functions";

export const Route = createFileRoute("/templates/thanks")({
  staticData: { sitemap: false },
  validateSearch: (s: Record<string, unknown>) => ({ txn: typeof s["txn"] === "string" ? s["txn"] : "" }),
  head: () => ({ meta: [
    { title: "Thanks for your purchase — FieldCO" },
    { name: "description", content: "Your FieldCO template purchase confirmation and access to your forms." },
    { property: "og:title", content: "Thanks for your purchase — FieldCO" },
    { property: "og:description", content: "Your FieldCO template purchase confirmation and access to your forms." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Thanks,
});

function Thanks() {
  const { txn } = Route.useSearch();
  const navigate = useNavigate();
  const [waiting, setWaiting] = useState(true);

  useEffect(() => {
    if (!txn) { setWaiting(false); return; }
    let tries = 0;
    let stop = false;
    const poll = async () => {
      const token = await getTokenForTransaction({ data: { txn } }).catch(() => null);
      if (stop) return;
      if (token) { navigate({ to: "/templates/access/$token", params: { token } }); return; }
      if (++tries < 20) setTimeout(poll, 2000); else setWaiting(false);
    };
    poll();
    return () => { stop = true; };
  }, [txn, navigate]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-3 p-8 text-center">
      <h1 className="text-3xl font-extrabold text-heading">Thanks for your purchase!</h1>
      <p className="text-muted-foreground">
        {waiting ? "Getting your templates ready…" : "We've emailed you a link to your templates. It can take a minute or two to arrive."}
      </p>
      {!waiting && (
        <p className="text-sm text-muted-foreground">
          Nothing arrived? <a href="mailto:hello@thecommandsuite.com" className="font-semibold text-accent-foreground underline">Email hello@thecommandsuite.com</a> and we'll resend your link.
        </p>
      )}
    </main>
  );
}
